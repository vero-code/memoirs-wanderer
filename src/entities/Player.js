// src/entities/Player.js
import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  cursors;
  spaceKey;
  isAttacking = false;
  lastDirection = 'down';
  toolSprite;
  nextStepTime = 0;

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(2);
    this.setCollideWorldBounds(true);

    this.toolSprite = scene.add.sprite(x, y, 'town_sheet', 0);
    this.toolSprite.setVisible(false);
    this.toolSprite.setDepth(3);

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

    this.updateToolBehavior();

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

    // --- FOOTSTEPS SOUND LOGIC ---
    const isMoving = this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
    if (isMoving) {
      if (this.scene.time.now > this.nextStepTime) {
        this.scene.sound.play('sfx_step', {
          volume: 0.3,
          rate: Phaser.Math.FloatBetween(0.9, 1.1),
        });

        this.nextStepTime = this.scene.time.now + 500;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.attack();
    }
  }

  // --- TOOL LOGIC ---
  updateToolBehavior() {
    if (!this.toolSprite) return;

    let offsetX = 0;
    let offsetY = 5;
    let rotation = 0;

    if (this.lastDirection === 'left' || this.lastDirection === 'up') {
      offsetX = -12;
      this.toolSprite.setFlipX(false);
      this.toolSprite.setDepth(this.depth + 1);
    } else if (
      this.lastDirection === 'right' ||
      this.lastDirection === 'down'
    ) {
      offsetX = 12;
      this.toolSprite.setFlipX(true);
      this.toolSprite.setDepth(this.depth + 1);
    }

    this.toolSprite.setPosition(this.x + offsetX, this.y + offsetY);

    const stones = this.scene.stones;
    let isNearStone = false;

    if (stones) {
      const closest = this.scene.physics.closest(this, stones.getChildren());
      if (
        closest &&
        Phaser.Math.Distance.Between(this.x, this.y, closest.x, closest.y) < 40
      ) {
        isNearStone = true;
      }
    }

    if (isNearStone) {
      this.toolSprite.setFrame(129);
      this.toolSprite.setVisible(true);
    } else {
      this.toolSprite.setVisible(false);
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
      onUpdate: () => {
        this.updateToolBehavior();
      },
      onComplete: () => {
        this.isAttacking = false;
      },
    });

    if (this.toolSprite.visible) {
      this.scene.tweens.add({
        targets: this.toolSprite,
        angle: this.lastDirection === 'left' ? -45 : 45,
        duration: 50,
        yoyo: true,
      });
    }

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

  destroy(fromScene) {
    if (this.toolSprite) this.toolSprite.destroy();
    super.destroy(fromScene);
  }
}
