// src/entities/Stone.js
import Phaser from 'phaser';

export default class Stone extends Phaser.Physics.Arcade.Sprite {
  maxHits = 3;
  currentHits = 0;
  isBeingDestroyed = false;

  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body

    this.body.setSize(14, 10);
    this.body.setOffset(1, 3);
    this.setDepth(y);
  }

  hit() {
    if (this.isBeingDestroyed) return false;

    this.currentHits++;

    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    });

    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX + Phaser.Math.Between(-2, 2),
      duration: 50,
      yoyo: true,
      repeat: 1,
    });

    if (this.currentHits === 1) {
      this.setTint(0xcccccc);
    } else if (this.currentHits === 2) {
      this.setTint(0x999999);
    }

    if (this.currentHits >= this.maxHits) {
      this.destroy();
      return true;
    }

    return false;
  }

  destroy(fromScene) {
    if (this.isBeingDestroyed) return;
    this.isBeingDestroyed = true;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 200,
      onComplete: () => {
        super.destroy(fromScene);
      },
    });

    this.createDestructionEffect();
  }

  createDestructionEffect() {
    for (let i = 0; i < 4; i++) {
      const particle = this.scene.add.rectangle(
        this.x,
        this.y,
        3,
        3,
        0x666666
      );
      particle.setDepth(this.depth + 1);

      this.scene.tweens.add({
        targets: particle,
        x: this.x + Phaser.Math.Between(-20, 20),
        y: this.y + Phaser.Math.Between(-20, 20),
        alpha: 0,
        duration: 300,
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}