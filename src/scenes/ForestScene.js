// src/scenes/ForestScene.js
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import { ExitZoneHelper } from '../utils/ExitZoneHelper.js';
import { TimeOfDayHelper } from '../utils/TimeOfDayHelper.js';
import { CombatHelper } from '../utils/CombatHelper.js';

export default class ForestScene extends Phaser.Scene {
  player;
  enemies;
  isEvening = false;

  constructor() {
    super('ForestScene');
  }

  create() {
    this.loadGameState();
    this.createWorld();
    this.createPlayer();
    this.createEnemies();
    this.setupCamera();
    this.setupCollisions();
    this.setupCombat();
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

    // Trees
    this.trees = this.physics.add.staticGroup();
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 750);
      const tree = this.trees.create(x, y, 'town_sheet', 5);
      tree.body.setSize(10, 10);
      tree.body.setOffset(3, 3);
      tree.setDepth(1);
    }
  }

  createPlayer() {
    this.player = new Player(this, 20, 100, 'player_sheet', 112);
    this.player.setCollideWorldBounds(true);
  }

  createEnemies() {
    this.enemies = this.add.group();
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(200, 700);
      const zombie = new Enemy(this, x, y, 'player_sheet', 122, this.player);
      this.enemies.add(zombie);
    }
  }

  setupCamera() {
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.trees);
    this.physics.add.collider(this.enemies, this.trees);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      player.takeDamage();
    });
  }

  setupCombat() {
    CombatHelper.setupCombatSystem(this, this.enemies, () => {
      this.events.emit('enemy-killed');
    });
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
      this.scene.stop('UIScene');
      this.scene.start('GameScene', { fromForest: true });
    });
  }

  update() {
    this.player.update();
    this.enemies.children.iterate((child) => {
      if (child) child.update();
    });
  }
}
