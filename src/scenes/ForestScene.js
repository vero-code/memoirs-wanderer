// src/scenes/ForestScene.js
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import AmbushBush from '../entities/AmbushBush.js';
import Stone from '../entities/Stone.js';
import { ExitZoneHelper } from '../utils/ExitZoneHelper.js';
import { TimeOfDayHelper } from '../utils/TimeOfDayHelper.js';
import { CombatHelper } from '../utils/CombatHelper.js';
import { SaveManager } from '../utils/SaveManager.js';

export default class ForestScene extends Phaser.Scene {
  player;
  enemies;
  ambushBushes;
  trees;
  stones;
  objectsLayer;
  isEvening = false;
  isDay2 = false;
  isFalling = false;

  constructor() {
    super('ForestScene');
  }

  create() {
    this.loadGameState();
    this.createWorld();
    this.createPlayer();
    this.createEnemies();
    this.createAmbushBushes();
    this.setupCamera();
    this.setupCollisions();
    this.setupCombat();
    this.setupStoneDestruction();
    this.setupUI();
    this.applyTimeOfDay();
    this.setupExitZone();
    if (!this.isDay2) {
      this.createFallTrigger();
    } else {
      this.createLostBag();
    }
  }

  loadGameState() {
    this.isEvening = this.registry.get('isEvening') || false;
    const day = this.registry.get('dayCount') || 1;
    this.isDay2 = day >= 2;
  }

  createWorld() {
    const map = this.make.tilemap({ key: 'map_forest' });
    const tileset = map.addTilesetImage('Tilemap', 'battle_sheet');

    const shadowsLayer = map.createLayer('Shadows', tileset, 0, 0);
    if (shadowsLayer) shadowsLayer.setDepth(1);

    const groundLayer = map.createLayer('Terrain', tileset, 0, 0);
    if (groundLayer) groundLayer.setDepth(0);

    this.objectsLayer = map.createLayer('Objects', tileset, 0, 0);
    if (this.objectsLayer) {
        this.objectsLayer.setDepth(1);
        this.objectsLayer.setCollisionByProperty({ collides: true }); 
    }

    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    const margin = 15;
    const playerSafeRadius = 5;

    const safeZoneRight = 4 * 16;
    const maxX = mapWidth - safeZoneRight - margin;

    // --- TREES ---
    this.trees = this.physics.add.staticGroup();
    const treeCount = 50;
    const treeTiles = 'town_sheet';
    const treeFrame = 5;

    for (let i = 0; i < treeCount; i++) {
      const x = Phaser.Math.Between(margin, maxX);
      const y = Phaser.Math.Between(margin, mapHeight - margin);
      if (Phaser.Math.Distance.Between(x, y, 20, 100) > playerSafeRadius) {
        const tree = this.trees.create(x, y, treeTiles, treeFrame);
        tree.body.setOffset(3, 3);
        tree.setDepth(y);
      }
    }

    // --- STONES ---
    this.stones = this.add.group();
    const stoneCount = 20;
    const stoneTiles = 'tiny_ski';
    const stoneFrame = 81;

    for (let i = 0; i < stoneCount; i++) {
      const x = Phaser.Math.Between(margin, maxX);
      const y = Phaser.Math.Between(margin, mapHeight - margin);
      if (Phaser.Math.Distance.Between(x, y, 20, 100) > playerSafeRadius) {
        const stone = new Stone(this, x, y, stoneTiles, stoneFrame);
        this.stones.add(stone);
      }
    }
  }

  createPlayer() {
    this.player = new Player(this, 20, 100, 'player_sheet', 112);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(this.player.y);
  }

  createEnemies() {
    this.enemies = this.add.group();

    const bounds = this.physics.world.bounds;
    const margin = 50;

    const safeZoneRight = 4 * 16;
    const maxX = bounds.width - safeZoneRight - margin;

    // --- ENEMIES ---
    const enemyTiles = 'player_sheet';
    const enemyFrame = 122;

    // Enemy On
    for (let i = 0; i < 2; i++) {
      const x = Phaser.Math.Between(100, maxX);
      const y = Phaser.Math.Between(100, bounds.height - margin);

      const enemy = new Enemy(this, x, y, enemyTiles, enemyFrame, this.player);
      enemy.setDepth(enemy.y);
      this.enemies.add(enemy);
    }
  }

  createAmbushBushes() {
    this.ambushBushes = this.add.group({ runChildUpdate: true });
    const bounds = this.physics.world.bounds;
    const margin = 10;
    const playerSafeRadius = 100;
    const safeZoneRight = 4 * 16;
    const maxX = bounds.width - safeZoneRight - margin;
    // --- BUSHES ---
    const bushCount = 15;
    const bushTiles = 'town_sheet';
    const bushFrame = 5;
    for (let i = 0; i < bushCount; i++) {
      const x = Phaser.Math.Between(margin, maxX);
      const y = Phaser.Math.Between(margin, bounds.height - margin);
      // Safety check (to avoid appearing on the player's head)
      if (Phaser.Math.Distance.Between(x, y, 20, 100) > playerSafeRadius) {
        const bush = new AmbushBush(
          this,
          x,
          y,
          bushTiles,
          bushFrame,
          this.player,
          this.enemies,
        );
        bush.setDepth(bush.y);
        this.ambushBushes.add(bush);
      }
    }
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.trees);
    this.physics.add.collider(this.enemies, this.trees);
    this.physics.add.collider(this.player, this.stones, null, null, this);
    this.physics.add.collider(this.enemies, this.stones);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.player, this.ambushBushes);

    if (this.objectsLayer) {
        this.physics.add.collider(this.player, this.objectsLayer);
        this.physics.add.collider(this.enemies, this.objectsLayer);
    }
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      player.takeDamage();
    });
  }

  setupCombat() {
    CombatHelper.setupCombatSystem(this, this.enemies, (enemyX, enemyY) => {
      this.events.emit('enemy-killed');

      const dropAmount = Phaser.Math.Between(1, 10);
      const currentCoins = this.registry.get('playerCoins') || 0;
      this.registry.set('playerCoins', currentCoins + dropAmount);

      this.showFloatingText(enemyX, enemyY, `+${dropAmount} 🪙`);

      const uiScene = this.scene.get('UIScene');
      if (uiScene) {
        uiScene.animateCoinGain(dropAmount);
      }
    });
  }

  setupStoneDestruction() {
    this.events.on('player-attack', (x, y, direction) => {
      this.checkStoneHit(x, y, direction);
    });
  }

  checkStoneHit(playerX, playerY, direction) {
    const hitRange = 25;

    this.stones.children.iterate((stone) => {
      if (!stone || !stone.active) return;

      const distance = Phaser.Math.Distance.Between(
        playerX,
        playerY,
        stone.x,
        stone.y,
      );

      if (distance < hitRange) {
        const isCorrectDirection = this.checkHitDirection(
          playerX,
          playerY,
          stone.x,
          stone.y,
          direction,
        );

        if (isCorrectDirection) {
          this.sound.play('sfx_mine', {
            volume: 0.5,
            rate: Phaser.Math.FloatBetween(0.9, 1.1),
          });
          const destroyed = stone.hit();
          if (destroyed) {
            this.sound.play('sfx_stone_break', { volume: 0.6 });
            this.events.emit('stone-destroyed');

            const currentCount = this.registry.get('hasStone') || 0;
            this.registry.set('hasStone', currentCount + 1);
            this.events.emit('get-stone');
          }
        }
      }
    });
  }

  checkHitDirection(playerX, playerY, stoneX, stoneY, direction) {
    const dx = stoneX - playerX;
    const dy = stoneY - playerY;

    switch (direction) {
      case 'left':
        return dx < 0;
      case 'right':
        return dx > 0;
      case 'up':
        return dy < 0;
      case 'down':
        return dy > 0;
      default:
        return false;
    }
  }

  setupUI() {
    this.scene.launch('UIScene', {
      isEvening: this.isEvening,
      animated: false,
      locationKey: 'location_forest',
    });
  }

  applyTimeOfDay() {
    TimeOfDayHelper.applyTimeOfDay(this, this.isEvening, false);
  }

  showFloatingText(x, y, message) {
    const text = this.add
      .text(x, y - 20, message, {
        fontSize: '16px',
        fontStyle: 'bold',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
  }

  setupExitZone() {
    const exitZone = ExitZoneHelper.createLeftExit(this);
    this.physics.add.overlap(this.player, exitZone, () => {
      this.cleanupScene();
      this.scene.stop('UIScene');
      this.scene.start('GameScene', { fromForest: true });
    });
  }

  cleanupScene() {
    this.events.off('player-attack');
    this.events.off('stone-destroyed');
    if (this.enemies) {
      this.enemies.clear(true, true);
    }
    if (this.ambushBushes) {
      this.ambushBushes.clear(true, true);
    }
    if (this.stones) {
      this.stones.clear(true, true);
    }
  }

  shutdown() {
    this.cleanupScene();
  }

  update() {
    if (!this.player || !this.player.active) return;
    this.player.update();
    this.player.setDepth(this.player.y);
    if (this.enemies) {
      this.enemies.children.iterate((child) => {
        if (child && child.active) {
          child.update();
          child.setDepth(child.y);
        }
      });
    }
  }

  createFallTrigger() {
    const mapWidth = this.physics.world.bounds.width;
    const mapHeight = this.physics.world.bounds.height;

    const cliffX = mapWidth - 50;
    const gapY = mapHeight / 2;
    const zoneWidth = 50;
    const zoneHeight = 60;

    const zone = this.add.zone(cliffX, gapY, zoneWidth, zoneHeight);
    this.physics.add.existing(zone, true);

    this.physics.add.overlap(this.player, zone, () => {
      this.sound.play('sfx_cliff', { volume: 0.6 });
      this.handleFall();
    });
  }

  handleFall() {
    if (this.isFalling) return;
    this.isFalling = true;

    this.player.setVelocity(0);
    this.input.keyboard.enabled = false;
    this.events.emit('show-dialog', this.getText('heroThoughts_fall'));

    const currentDiary = this.registry.get('hasDiary');
    const currentArmor = this.registry.get('hasArmor');
    const currentPotato = this.registry.get('hasPotato');
    const currentStone = this.registry.get('hasStone');

    this.registry.set('bag_hasDiary', currentDiary || false);
    this.registry.set('bag_hasArmor', currentArmor || false);
    this.registry.set('bag_hasPotato', currentPotato || false);
    this.registry.set('bag_hasStone', currentStone || 0);

    this.cameras.main.fadeOut(2000, 0, 0, 0);

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.events.emit('hide-dialog');

        this.registry.set('dayCount', 2);
        this.registry.set('isEvening', false);

        this.registry.set('hasDiary', false);
        this.registry.set('hasArmor', false);
        this.registry.set('hasPotato', false);
        this.registry.set('hasStone', 0);

        this.registry.set('itemsLost', true);

        SaveManager.save(this);

        this.scene.stop('UIScene');
        this.input.keyboard.enabled = true;
        this.scene.start('GameScene', { isDay2WakeUp: true });
      },
    );
  }

  createLostBag() {
    const itemsLost = this.registry.get('itemsLost');

    if (itemsLost) {
      const mapWidth = this.physics.world.bounds.width;
      const mapHeight = this.physics.world.bounds.height;

      const bagX = mapWidth - 100;
      const bagY = mapHeight / 2;

      const bag = this.physics.add.sprite(bagX, bagY, 'town_sheet', 29);

      this.physics.add.overlap(this.player, bag, () => {
        this.collectBag(bag);
      });
    }
  }

  collectBag(bag) {
    bag.destroy();
    this.sound.play('sfx_bag', { volume: 0.6 });

    const savedDiary = this.registry.get('bag_hasDiary');
    const savedArmor = this.registry.get('bag_hasArmor');
    const savedPotato = this.registry.get('bag_hasPotato');
    const savedStone = this.registry.get('bag_hasStone');

    this.registry.set('hasDiary', savedDiary);
    this.registry.set('hasArmor', savedArmor);
    this.registry.set('hasPotato', savedPotato);
    this.registry.set('hasStone', savedStone);

    this.registry.set('itemsLost', false);

    this.events.emit('get-diary');
    this.events.emit('get-armor');
    this.events.emit('get-potato');
    this.events.emit('get-stone');

    this.showThought('heroThoughts_bag');

    SaveManager.save(this);
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  showThought(textKey) {
    const text = this.getText(textKey);

    if (this.currentThought) this.currentThought.destroy();

    this.currentThought = this.add
      .text(this.player.x, this.player.y - 40, text, {
        fontSize: '14px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 6, y: 4 },
        align: 'center',
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.tweens.add({
      targets: this.currentThought,
      y: this.currentThought.y - 30,
      alpha: 0,
      duration: 2500,
      ease: 'Power1',
      onComplete: () => {
        if (this.currentThought) {
          this.currentThought.destroy();
          this.currentThought = null;
        }
      },
    });
  }
}
