// src/scenes/GameScene.js
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  map;
  player;
  layers = {};
  cursors;

  constructor() {
    super("GameScene");
  }

  create() {
    this.map = this.make.tilemap({ key: "map_dungeon" });
    const tileset = this.map.addTilesetImage("tileset", "tiles_dungeon");

    this.layers.ground = this.map.createLayer("Dungeon", tileset, 0, 0);
    this.layers.ground.setDepth(0);

    this.layers.objects = this.map.createLayer("Objects", tileset, 0, 0);
    this.layers.objects.setDepth(1);

    this.layers.carts = this.map.createLayer("Carts", tileset, 0, 0);
    this.layers.carts.setDepth(3);

    this.player = this.physics.add.sprite(110, 150, "player_sheet", 112);
    this.player.setDepth(2);

    this.cursors = this.input.keyboard.createCursorKeys();

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setZoom(2);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.player.setCollideWorldBounds(true);

    this.layers.ground.setCollisionByProperty({ collides: true });
    this.layers.objects.setCollisionByProperty({ collides: true });
    this.layers.carts.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.player, this.layers.ground);
    this.physics.add.collider(this.player, this.layers.objects);
    this.physics.add.collider(this.player, this.layers.carts);
  }

  update(time, delta) {
    this.player.setVelocity(0);
    const speed = 100;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    this.player.body.velocity.normalize().scale(speed);
  }
}
