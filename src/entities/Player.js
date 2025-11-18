// src/entities/Player.js
import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cursors;

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(2);
    this.setCollideWorldBounds(true);

    this.cursors = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  update() {
    this.setVelocity(0);
    const speed = 100;

    if (this.cursors.left.isDown || this.cursors.A.isDown) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (this.cursors.right.isDown || this.cursors.D.isDown) {
      this.setVelocityX(speed);
      this.setFlipX(false);
    }

    if (this.cursors.up.isDown || this.cursors.W.isDown) {
      this.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.cursors.S.isDown) {
      this.setVelocityY(speed);
    }

    this.body.velocity.normalize().scale(speed);
  }
}