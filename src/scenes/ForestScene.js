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
  isEvening = false;
  isDay2 = false;

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
    // Ground tiles
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        this.add.image(x * 16, y * 16, 'town_sheet', 0).setOrigin(0);
      }
    }

    this.physics.world.setBounds(0, 0, 800, 800);

    // --- TREES ---
    this.trees = this.physics.add.staticGroup();
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 750);
      if (Phaser.Math.Distance.Between(x, y, 20, 100) > 50) {
        const tree = this.trees.create(x, y, 'town_sheet', 5);
        tree.body.setSize(10, 10);
        tree.body.setOffset(3, 3);
        tree.setDepth(y);
      }
    }

    // --- STONES ---
    this.stones = this.add.group();
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 750);
      if (Phaser.Math.Distance.Between(x, y, 20, 100) > 50) {
        const stone = new Stone(this, x, y, 'tiny_ski', 81);
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
    for (let i = 0; i < 2; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(200, 700);
      const zombie = new Enemy(this, x, y, 'player_sheet', 122, this.player);
      zombie.setDepth(zombie.y);
      this.enemies.add(zombie);
    }
  }

  createAmbushBushes() {
    this.ambushBushes = this.add.group({ runChildUpdate: true });

    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(100, 750);
      const y = Phaser.Math.Between(50, 750);
      const bush = new AmbushBush(
        this,
        x,
        y,
        'town_sheet',
        5,
        this.player,
        this.enemies,
      );
      bush.setDepth(bush.y);
      this.ambushBushes.add(bush);
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
          const destroyed = stone.hit();
          if (destroyed) {
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
    const x = 280;
    const y = 400;
    const width = 20;
    const height = 800;

    const zone = this.add.zone(x, y, width, height);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => {
      this.handleFall();
    });

    const abyss = this.add.rectangle(x + 10, y, width + 50, height, 0x000000);
    abyss.setDepth(0);

    for (let i = 0; i < height; i += 25) {
      const stoneX = x - 15 + Phaser.Math.Between(-3, 3);

      const decoration = this.add.image(stoneX, i, 'town_sheet', 81);
      decoration.setTint(0x666666);
      decoration.setScale(0.8);
      decoration.setDepth(0);
    }
  }

  handleFall() {
    this.player.setVelocity(0);
    this.input.keyboard.enabled = false;

    this.events.emit('show-dialog', this.getText('heroThoughts_fall'));

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
      const bag = this.physics.add.sprite(750, 400, 'town_sheet', 29);

      this.physics.add.overlap(this.player, bag, () => {
        this.collectBag(bag);
      });
    }
  }

  collectBag(bag) {
    bag.destroy();

    this.registry.set('hasDiary', true);
    this.registry.set('hasArmor', true);
    this.registry.set('hasPotato', true);
    this.registry.set('itemsLost', false);

    this.events.emit('get-diary');
    this.events.emit('get-armor');
    this.events.emit('get-potato');
    this.events.emit('show-dialog', this.getText('heroThoughts_bag'));

    SaveManager.save(this);
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }
}
