// src/scenes/UIScene.js
import Phaser from 'phaser';
import { HealthDisplay } from '../components/HealthDisplay.js';

export default class UIScene extends Phaser.Scene {
  dialogText;
  diaryIcon;
  armorIcon;
  potatoIcon;
  darknessOverlay;
  healthDisplay;
  scoreText;
  langButton;
  score = 0;
  gameOverText;
  finalScoreText;
  restartButton;

  gameScenes = ['GameScene', 'ForestScene'];

  initialIsEvening = false;
  initialAnimated = false;

  constructor() {
    super('UIScene');
  }

  init(data) {
    this.initialIsEvening = data?.isEvening || false;
    this.initialAnimated = data?.animated !== undefined ? data.animated : false;
  }

  create() {
    this.resetState();
    this.createUI();
    this.createHealthDisplay();
    this.createIcons();
    this.restoreInventoryUI();
    this.createLanguageButton();
    this.createDarknessOverlay();
    this.applyInitialTimeOfDay();
    this.connectGameSceneEvents();
  }

  resetState() {
    this.score = 0;
    this.gameOverText = null;
    this.finalScoreText = null;
    this.restartButton = null;
  }

  createUI() {
    // Dialog text
    this.dialogText = this.add
      .text(400, 550, '', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 20 },
        wordWrap: { width: 700 },
        align: 'center',
      })
      .setOrigin(0.5);
    this.dialogText.setVisible(false);
    this.dialogText.setDepth(100);

    // Score text
    this.scoreText = this.add
      .text(400, 20, '💀 Score: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);
    this.scoreText.setDepth(100);
  }

  createHealthDisplay() {
    this.healthDisplay = new HealthDisplay(this, 3);
  }

  createIcons() {
    this.diaryIcon = this.createIcon(650, 'uiDiary', '#FFFF00');
    this.armorIcon = this.createIcon(510, 'uiArmor', '#00FFFF');
    this.potatoIcon = this.createIcon(370, 'uiPotato', '#FFA500');
  }

  createIcon(x, key, color) {
    const icon = this.add.text(x, 20, this.getText(key), {
      fontSize: '20px',
      fill: color,
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    });
    icon.setVisible(false);
    icon.setAlpha(1);
    icon.setDepth(10);
    icon.localeKey = key;
    return icon;
  }

  restoreInventoryUI() {
    if (this.registry.get('hasDiary')) {
      this.diaryIcon.setVisible(true);
      this.diaryIcon.setAlpha(1);
    }
    if (this.registry.get('hasArmor')) {
      this.armorIcon.setVisible(true);
      this.armorIcon.setAlpha(1);
    }
    if (this.registry.get('hasPotato')) {
      this.potatoIcon.setVisible(true);
      this.potatoIcon.setAlpha(1);
    }
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  createLanguageButton() {
    const currentLang = this.registry.get('current_lang') || 'en';
    this.langButton = this.add
      .text(750, 570, currentLang.toUpperCase(), {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 },
        fixedWidth: 40,
        align: 'center',
      })
      .setOrigin(1, 1)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    this.langButton.on('pointerdown', () => {
      this.toggleLanguage();
    });
    this.langButton.on('pointerover', () =>
      this.langButton.setStyle({ fill: '#ffff00' }),
    );
    this.langButton.on('pointerout', () =>
      this.langButton.setStyle({ fill: '#ffffff' }),
    );
  }

  toggleLanguage() {
    const current = this.registry.get('current_lang');
    const next = current === 'en' ? 'ru' : 'en';
    this.registry.set('current_lang', next);
    const newData = this.cache.json.get(`locale_${next}`);
    this.registry.set('locale_data', newData);

    this.langButton.setText(next.toUpperCase());
    this.updateUITexts();

    this.gameScenes.forEach((key) => {
      const scene = this.scene.get(key);
      if (scene) {
        scene.events.emit('language-changed');
      }
    });
  }

  updateUITexts() {
    this.scoreText.setText(`${this.getText('uiScore')}${this.score}`);

    if (this.diaryIcon)
      this.diaryIcon.setText(this.getText(this.diaryIcon.localeKey));
    if (this.armorIcon)
      this.armorIcon.setText(this.getText(this.armorIcon.localeKey));
    if (this.potatoIcon)
      this.potatoIcon.setText(this.getText(this.potatoIcon.localeKey));

    if (this.gameOverText) this.gameOverText.setText(this.getText('uiYouDied'));
    if (this.finalScoreText)
      this.finalScoreText.setText(
        `${this.getText('uiFinalScore')}${this.score}`,
      );
    if (this.restartButton)
      this.restartButton.setText(this.getText('uiRestart'));
  }

  createDarknessOverlay() {
    this.darknessOverlay = this.add.rectangle(0, 0, 800, 600, 0x000022);
    this.darknessOverlay.setOrigin(0, 0);
    this.darknessOverlay.setAlpha(0);
    this.darknessOverlay.setDepth(-1);
  }

  applyInitialTimeOfDay() {
    if (this.initialIsEvening) {
      this.darknessOverlay.setAlpha(0.3);
    }
  }

  connectGameSceneEvents() {
    this.gameScenes.forEach((sceneKey) => {
      const scene = this.scene.get(sceneKey);
      if (scene) {
        this.disconnectSceneEvents(scene);
        this.connectSceneEvents(scene);
      }
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.gameScenes.forEach((sceneKey) => {
        const scene = this.scene.get(sceneKey);
        if (scene) this.disconnectSceneEvents(scene);
      });
    });
  }

  disconnectSceneEvents(scene) {
    scene.events.off('show-dialog');
    scene.events.off('hide-dialog');
    scene.events.off('get-diary');
    scene.events.off('get-armor');
    scene.events.off('get-potato');
    scene.events.off('set-time');
    scene.events.off('player-hit');
    scene.events.off('enemy-killed');
  }

  connectSceneEvents(scene) {
    scene.events.on('show-dialog', this.handleShowDialog, this);
    scene.events.on('hide-dialog', this.handleHideDialog, this);
    scene.events.on('get-diary', () => this.pulseIcon(this.diaryIcon), this);
    scene.events.on('get-armor', () => this.pulseIcon(this.armorIcon), this);
    scene.events.on('get-potato', () => this.pulseIcon(this.potatoIcon), this);
    scene.events.on('set-time', this.handleSetTime, this);
    scene.events.on('player-hit', this.handlePlayerHit, this);
    scene.events.on('enemy-killed', this.handleEnemyKilled, this);
  }

  handleShowDialog(text) {
    this.dialogText.setText(text);
    this.dialogText.setVisible(true);
  }

  handleHideDialog() {
    this.dialogText.setVisible(false);
  }

  handleSetTime(time, animated = true) {
    let targetAlpha = 0;
    if (time === 'dusk') targetAlpha = 0.3;
    if (time === 'night') targetAlpha = 0.7;

    if (animated) {
      this.tweens.add({
        targets: this.darknessOverlay,
        alpha: targetAlpha,
        duration: 2000,
      });
    } else {
      this.darknessOverlay.setAlpha(targetAlpha);
    }
  }

  handlePlayerHit() {
    const isDead = this.healthDisplay.takeDamage();
    if (isDead) {
      this.triggerGameOver();
    }
  }

  handleEnemyKilled() {
    this.score += 100;
    this.scoreText.setText(`${this.getText('uiScore')}${this.score}`);
    this.animateScoreIncrease();
  }

  animateScoreIncrease() {
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
    });
  }

  triggerGameOver() {
    this.createGameOverScreen();
    this.pauseGameScenes();
  }

  createGameOverScreen() {
    this.gameOverText = this.add
      .text(400, 250, this.getText('uiYouDied'), {
        fontSize: '64px',
        fill: '#ff0000',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.finalScoreText = this.add
      .text(400, 320, `${this.getText('uiFinalScore')}${this.score}`, {
        fontSize: '32px',
        fill: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.restartButton = this.add
      .text(400, 400, this.getText('uiRestart'), {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });

    this.setupRestartButton(this.restartButton);
    this.setupRestartKeyboard();
  }

  setupRestartButton(button) {
    button.on('pointerover', () => {
      button.setStyle({ fill: '#ffff00' });
    });

    button.on('pointerout', () => {
      button.setStyle({ fill: '#ffffff' });
    });

    button.on('pointerdown', () => {
      this.restartGame();
    });
  }

  setupRestartKeyboard() {
    this.input.keyboard.once('keydown-R', () => {
      this.restartGame();
    });
  }

  pauseGameScenes() {
    this.gameScenes.forEach((key) => {
      const scene = this.scene.get(key);
      if (scene && scene.scene.isActive()) {
        scene.scene.pause();
      }
    });
  }

  restartGame() {
    this.clearGameState();
    this.healthDisplay.reset();
    this.stopAllGameScenes();
    this.scene.start('GameScene');
  }

  clearGameState() {
    this.registry.set('hasDiary', false);
    this.registry.set('hasArmor', false);
    this.registry.set('hasPotato', false);
    this.registry.set('isEvening', false);
  }

  stopAllGameScenes() {
    this.gameScenes.forEach((key) => {
      this.scene.stop(key);
    });
  }

  pulseIcon(target) {
    target.setVisible(true);
    this.tweens.add({
      targets: target,
      alpha: 0.2,
      duration: 300,
      ease: 'Linear',
      yoyo: true,
      repeat: 3,
    });
  }
}
