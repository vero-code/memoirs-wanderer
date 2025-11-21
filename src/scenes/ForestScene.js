// src/scenes/ForestScene.js
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import AmbushBush from '../entities/AmbushBush.js';
import Stone from '../entities/Stone.js';
import { ExitZoneHelper } from '../utils/ExitZoneHelper.js';
import { TimeOfDayHelper } from '../utils/TimeOfDayHelper.js';
import { CombatHelper } from '../utils/CombatHelper.js';

export default class ForestScene extends Phaser.Scene {
  player;
  enemies;
  ambushBushes;
  trees;
  stones;
  isEvening = false;

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
  }

  loadGameState() {
    this.isEvening = this.registry.get('isEvening') || false;
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
    CombatHelper.setupCombatSystem(this, this.enemies, () => {
      this.events.emit('enemy-killed');
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
    });
  }

  applyTimeOfDay() {
    TimeOfDayHelper.applyTimeOfDay(this, this.isEvening, false);
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
}
