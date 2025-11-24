// src/scenes/TitleScene.js
import Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    // --- DEBUG MODE ---
    // this.handleInput();
    // return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const center = { x: width / 2, y: height / 2 };

    this.add
      .text(center.x, center.y - 50, this.getText('game_title').toUpperCase(), {
        fontFamily: 'serif',
        fontSize: '48px',
        fontStyle: 'bold',
        fill: '#ffcc00',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(center.x, center.y + 20, this.getText('game_subtitle'), {
        fontFamily: 'serif',
        fontSize: '24px',
        fontStyle: 'italic',
        fill: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(
        center.x,
        height - 100,
        this.getText('intro_continue'),
        { fontSize: '20px', fill: '#cccccc' },
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard.once('keydown', () => this.handleInput());
    this.input.once('pointerdown', () => this.handleInput());
  }

  handleInput() {
    const hasSave = SaveManager.load(this);
    if (hasSave) {
      const currentHealth = this.registry.get('playerHealth');
      if (!currentHealth || currentHealth <= 0) {
          SaveManager.clear(); 
          this.initNewGame(); 
          this.scene.start('GameScene');
      } else {
          this.scene.start('GameScene');
      }
    } else {
      this.initNewGame();
      this.scene.start('IntroScene');
      // this.scene.start('GameScene');
    }
  }

  initNewGame() {
    this.registry.set('playerHealth', 3);
    this.registry.set('isEvening', false);
    this.registry.set('dayCount', 1);

    this.registry.set('hasDiary', false);
    this.registry.set('hasArmor', false);
    this.registry.set('hasPotato', false);
    this.registry.set('hasStone', 0);

    this.registry.set('itemsLost', false);
    this.registry.set('hasEnteredTown', false);
    this.registry.set('receivedFreePotato', false);
    this.registry.set('receivedDiary', false);
    this.registry.set('playerCoins', 0);
    this.registry.set('hasVisitedForest', false);
    this.registry.set('metArmorer', false);
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }
}
