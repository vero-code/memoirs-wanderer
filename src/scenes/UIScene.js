// src/scenes/UIScene.js
import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  dialogText;
  diaryIcon;
  armorIcon;
  potatoIcon;
  darknessOverlay;
  hearts = [];
  maxHealth = 3;
  currentHealth = 3;
  scoreText;
  score = 0;

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
    this.createHearts();
    this.createIcons();
    this.restoreInventoryUI();
    this.createDarknessOverlay();
    this.applyInitialTimeOfDay();
    this.connectGameSceneEvents();
  }

  resetState() {
    this.hearts = [];
    this.currentHealth = this.maxHealth;
    this.score = 0;
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

  createHearts() {
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.text(20 + i * 30, 20, '❤️', { fontSize: '24px' });
      heart.setDepth(10);
      this.hearts.push(heart);
    }
  }

  createIcons() {
    this.diaryIcon = this.createIcon(650, '📔 Diary', '#FFFF00');
    this.armorIcon = this.createIcon(510, '🛡️ Armor', '#00FFFF');
    this.potatoIcon = this.createIcon(370, '🥔 Potato', '#FFA500');
  }

  createIcon(x, text, color) {
    const icon = this.add.text(x, 20, text, {
      fontSize: '20px',
      fill: color,
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 5 },
    });
    icon.setVisible(false);
    icon.setAlpha(1);
    icon.setDepth(10);
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
    if (this.currentHealth > 0) {
      this.currentHealth--;

      const heartToRemove = this.hearts[this.currentHealth];
      if (heartToRemove) {
        this.animateHeartRemoval(heartToRemove);
      }

      if (this.currentHealth <= 0) {
        this.triggerGameOver();
      }
    }
  }

  animateHeartRemoval(heart) {
    this.tweens.add({
      targets: heart,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => {
        heart.destroy();
      },
    });
  }

  handleEnemyKilled() {
    this.score += 100;
    this.scoreText.setText(`💀 Score: ${this.score}`);
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
    // Game Over Title
    const gameOverText = this.add
      .text(400, 250, 'YOU DIED', {
        fontSize: '64px',
        fill: '#ff0000',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(200);

    // Restart Button
    const restartButton = this.add
      .text(400, 350, '💀 RESTART (Press R)', {
        fontSize: '32px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(200)
      .setInteractive({ useHandCursor: true });

    this.setupRestartButton(restartButton);
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
