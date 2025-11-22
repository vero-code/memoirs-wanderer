// src/scenes/IntroScene.js
import Phaser from 'phaser';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const center = { x: width / 2, y: height / 2 };

    const volumeText = this.add
      .text(
        center.x,
        center.y - 60,
        `${this.getText('intro_volume')}\n${this.getText('intro_day1_title')}`,
        {
          fontFamily: 'monospace',
          fontSize: '28px',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setAlpha(0);

    const storyText = this.add
      .text(center.x, center.y + 40, this.getText('intro_day1_text'), {
        fontFamily: 'monospace',
        fontSize: '18px',
        fill: '#cccccc',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const continueText = this.add
      .text(center.x, height - 100, this.getText('intro_continue'), {
        fontSize: '18px',
        fill: '#ffffff',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: volumeText,
      alpha: 1,
      duration: 2000,
      onComplete: () => {
        this.tweens.add({
          targets: storyText,
          alpha: 1,
          duration: 2000,
          delay: 500,
        });
        this.tweens.add({
          targets: continueText,
          alpha: 1,
          duration: 1000,
          delay: 2000,
          yoyo: true,
          repeat: -1,
        });

        this.input.on('pointerdown', () => this.startGame());
        this.input.keyboard.on('keydown', () => this.startGame());
      },
    });
  }

  startGame() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start('GameScene');
      },
    );
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }
}
