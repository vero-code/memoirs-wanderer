// src/components/GameOverScreen.js
export class GameOverScreen {
  constructor(scene, score, onRestart) {
    this.scene = scene;
    this.score = score;
    this.onRestart = onRestart;

    this.gameOverText = null;
    this.finalScoreText = null;
    this.restartButton = null;
  }

  create() {
    this.createGameOverText();
    this.createFinalScoreText();
    this.createRestartButton();
    this.setupKeyboard();
  }

  createGameOverText() {
    this.gameOverText = this.scene.add
      .text(400, 250, this.getText('uiYouDied'), {
        fontSize: '64px',
        fill: '#ff0000',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(200);
  }

  createFinalScoreText() {
    this.finalScoreText = this.scene.add
      .text(400, 320, `${this.getText('uiFinalScore')}${this.score}`, {
        fontSize: '32px',
        fill: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(200);
  }

  createRestartButton() {
    this.restartButton = this.scene.add
      .text(400, 400, this.getText('uiRestart'), {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });

    this.restartButton.on('pointerover', () => {
      this.restartButton.setStyle({ fill: '#ffff00' });
    });

    this.restartButton.on('pointerout', () => {
      this.restartButton.setStyle({ fill: '#ffffff' });
    });

    this.restartButton.on('pointerdown', () => {
      this.onRestart();
    });
  }

  setupKeyboard() {
    this.scene.input.keyboard.once('keydown-R', () => {
      this.onRestart();
    });
  }

  updateTexts() {
    if (this.gameOverText) {
      this.gameOverText.setText(this.getText('uiYouDied'));
    }
    if (this.finalScoreText) {
      this.finalScoreText.setText(
        `${this.getText('uiFinalScore')}${this.score}`,
      );
    }
    if (this.restartButton) {
      this.restartButton.setText(this.getText('uiRestart'));
    }
  }

  getText(key) {
    const localeData = this.scene.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }
}