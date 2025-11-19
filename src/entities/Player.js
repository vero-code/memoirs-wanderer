// src/entities/Player.js
import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cursors;
  spaceKey;
  isAttacking = false;
  lastDirection = 'down';

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
    this.spaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  update() {
    if (!this.scene || !this.scene.scene.isActive()) {
      return;
    }
    if (this.isAttacking) return;
    this.setVelocity(0);
    const speed = 100;
    let moving = false;

    if (this.cursors.left.isDown || this.cursors.A.isDown) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
      this.lastDirection = 'left';
      moving = true;
    } else if (this.cursors.right.isDown || this.cursors.D.isDown) {
      this.setVelocityX(speed);
      this.setFlipX(false);
      this.lastDirection = 'right';
      moving = true;
    }

    if (this.cursors.up.isDown || this.cursors.W.isDown) {
      this.setVelocityY(-speed);
      this.lastDirection = 'up';
      moving = true;
    } else if (this.cursors.down.isDown || this.cursors.S.isDown) {
      this.setVelocityY(speed);
      this.lastDirection = 'down';
      moving = true;
    }

    this.body.velocity.normalize().scale(speed);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attack();
    }
  }

  attack() {
    if (!this.scene || !this.scene.scene.isActive()) {
      console.warn('Scene not active, cannot attack');
      return;
    }
    this.isAttacking = true;
    this.setVelocity(0);

    let targetX = this.x;
    let targetY = this.y;
    const lungeDist = 10;

    if (this.lastDirection === 'left') targetX -= lungeDist;
    else if (this.lastDirection === 'right') targetX += lungeDist;
    else if (this.lastDirection === 'up') targetY -= lungeDist;
    else if (this.lastDirection === 'down') targetY += lungeDist;

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.isAttacking = false;
      },
    });

    this.scene.events.emit('player-attack', this.x, this.y, this.lastDirection);
  }

  takeDamage() {
    if (this.alpha < 1) return;
    this.setTint(0xff0000);
    this.setAlpha(0.5);
    this.scene.events.emit('player-hit');
    this.scene.time.delayedCall(1000, () => {
      this.clearTint();
      this.setAlpha(1);
    });
  }
}
