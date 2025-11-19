// src/scenes/ForestScene.js
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export default class ForestScene extends Phaser.Scene {
  player;
  enemies;

  constructor() {
    super('ForestScene');
  }

  create() {
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) {
        this.add.image(x * 16, y * 16, 'town_sheet', 0).setOrigin(0);
      }
    }

    this.physics.world.setBounds(0, 0, 800, 800);

    const trees = this.physics.add.staticGroup();
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 750);
      const tree = trees.create(x, y, 'town_sheet', 5);
      tree.body.setSize(10, 10);
      tree.body.setOffset(3, 3);
      tree.setDepth(1);
    }

    this.player = new Player(this, 20, 100, 'player_sheet', 112);

    this.enemies = this.add.group();
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(200, 700);
      const zombie = new Enemy(this, x, y, 'player_sheet', 122, this.player);
      this.enemies.add(zombie);
    }

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, trees);
    this.physics.add.collider(this.enemies, trees);
    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      player.takeDamage();
    });

    this.events.on('player-attack', (x, y, direction) => {
      let hitX = x;
      let hitY = y;
      const range = 20;
      if (direction === 'left') hitX -= range;
      else if (direction === 'right') hitX += range;
      else if (direction === 'up') hitY -= range;
      else if (direction === 'down') hitY += range;

      const swordHitbox = this.physics.add.sprite(hitX, hitY, null);
      swordHitbox.setSize(24, 24);
      swordHitbox.setVisible(false);

      this.physics.overlap(swordHitbox, this.enemies, (sword, enemy) => {
        enemy.disableBody(true, true);
      });
      this.time.delayedCall(50, () => swordHitbox.destroy());
    });

    this.scene.launch('UIScene');

    const uiScene = this.scene.get('UIScene');
    this.events.on('player-hit', () => {
      uiScene.events.emit('player-hit-ui');
    });

    const exitZone = this.add.rectangle(0, 400, 20, 800, 0xff0000, 0);
    this.physics.world.enable(exitZone);
    exitZone.body.setAllowGravity(false);
    exitZone.body.moves = false;

    this.physics.add.overlap(this.player, exitZone, () => {
      console.log('Returning to City...');
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
