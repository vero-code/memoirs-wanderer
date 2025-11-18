// src/entities/Enemy.js
import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  target;
  speed = 40;

  constructor(scene, x, y, texture, frame, target) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.target = target;

    // Physics settings
    this.setDepth(2);
    this.setPushable(false);

    this.setCollideWorldBounds(true);
    this.body.setSize(12, 12);
    this.body.setOffset(2, 4);
  }

  update() {
    if (!this.target) return;
    const dist = Phaser.Math.Distance.Between(
      this.x, this.y,
      this.target.x, this.target.y
    );

    // Aggression radius
    if (dist < 200) {
       this.scene.physics.moveToObject(this, this.target, this.speed);
       
       if (this.body.velocity.x < 0) {
           this.setFlipX(true);
       } else {
           this.setFlipX(false);
       }
    } else {
       this.setVelocity(0);
    }
  }
}