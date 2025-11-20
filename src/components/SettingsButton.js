// src/components/SettingsButton.js
import Phaser from 'phaser';

export class SettingsButton {
  constructor(scene, x, y, onClickCallback) {
    this.scene = scene;
    this.container = null;
    this.onClickCallback = onClickCallback;

    this.create(x, y);
  }

  create(x, y) {
    this.container = this.scene.add.container(x, y);
    this.container.setDepth(95);

    const bg = this.scene.add.circle(0, 0, 25, 0x000000, 0.6);
    bg.setStrokeStyle(2, 0x888888);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => this.onClickCallback());

    const icon = this.scene.add
      .text(0, 0, '⚙️', { fontSize: '30px' })
      .setOrigin(0.5);

    this.container.add([bg, icon]);

    bg.on('pointerover', () => bg.setStrokeStyle(2, 0xffff00));
    bg.on('pointerout', () => bg.setStrokeStyle(2, 0x888888));
  }
}