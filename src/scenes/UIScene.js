// src/scenes/UIScene.js
import Phaser from 'phaser';
import { HealthDisplay } from '../components/HealthDisplay.js';
import {
  InventorySystem,
  INVENTORY_ITEMS,
} from '../components/InventorySystem.js';
import { BackpackButton } from '../components/BackpackButton.js';
import { SettingsButton } from '../components/SettingsButton.js';
import { SettingsMenu } from '../components/SettingsMenu.js';
import { GameOverScreen } from '../components/GameOverScreen.js';

export default class UIScene extends Phaser.Scene {
  // UI Components
  dialogText;
  scoreText;
  darknessOverlay;

  // Component instances
  healthDisplay;
  inventorySystem;
  backpackButton;
  settingsButton;
  settingsMenu;
  gameOverScreen;

  // State
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
    this.createComponents();
    this.createDarknessOverlay();
    this.applyInitialTimeOfDay();
    this.connectGameSceneEvents();
    this.setupKeyboardShortcuts();
  }

  resetState() {
    this.score = this.registry.get('score') || 0;
    this.gameOverScreen = null;
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  // --- UI CREATION ---

  createUI() {
    this.createDialogText();
    this.createScoreText();
  }

  createDialogText() {
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
  }

  createScoreText() {
    this.scoreText = this.add
      .text(400, 20, `${this.getText('uiScore')}${this.score}`, {
        fontSize: '24px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);
    this.scoreText.setDepth(100);
  }

  createComponents() {
    // Health Display
    this.healthDisplay = new HealthDisplay(this, 3);

    // Inventory System
    this.inventorySystem = new InventorySystem(this);
    this.inventorySystem.create();

    // Backpack Button
    this.backpackButton = new BackpackButton(this, 755, 35, () => {
      this.inventorySystem.toggle();
      if (this.settingsMenu.getIsOpen()) {
        this.settingsMenu.toggle();
      }
    });

   // Settings Button
    this.settingsButton = new SettingsButton(this, 690, 35, () => {
      this.settingsMenu.toggle();
      if (this.inventorySystem.getIsOpen()) {
        this.inventorySystem.toggle();
      }
    });

    // Settings Menu
    this.settingsMenu = new SettingsMenu(this, () => {
      this.updateUITexts();
      this.notifyLanguageChange();
    });
    this.settingsMenu.create();
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

  setupKeyboardShortcuts() {
    this.input.keyboard.on('keydown-I', () => {
      if (!this.settingsMenu.getIsOpen()) {
        this.inventorySystem.toggle();
      }
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.settingsMenu.getIsOpen()) {
        this.settingsMenu.toggle();
      } else if (this.inventorySystem.getIsOpen()) {
        this.inventorySystem.toggle();
      }
    });
  }

  // --- LANGUAGE ---

  notifyLanguageChange() {
    this.gameScenes.forEach((key) => {
      const scene = this.scene.get(key);
      if (scene) scene.events.emit('language-changed');
    });
  }

  updateUITexts() {
    this.scoreText.setText(`${this.getText('uiScore')}${this.score}`);

    if (this.gameOverScreen) {
      this.gameOverScreen.updateTexts();
    }

    if (this.inventorySystem) {
      this.inventorySystem.clearTooltip();
    }
  }

  // --- EVENTS ---

  connectGameSceneEvents() {
    this.gameScenes.forEach((sceneKey) => {
      const scene = this.scene.get(sceneKey);
      if (scene) {
        this.disconnectSceneEvents(scene);
        this.connectSceneEvents(scene);
      }
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupEvents();
    });
  }

  disconnectSceneEvents(scene) {
    scene.events.off('show-dialog');
    scene.events.off('hide-dialog');
    scene.events.off('set-time');
    scene.events.off('player-hit');
    scene.events.off('enemy-killed');
    INVENTORY_ITEMS.forEach((item) => scene.events.off(item.event));
  }

  connectSceneEvents(scene) {
    scene.events.on('show-dialog', this.handleShowDialog, this);
    scene.events.on('hide-dialog', this.handleHideDialog, this);
    scene.events.on('set-time', this.handleSetTime, this);
    scene.events.on('player-hit', this.handlePlayerHit, this);
    scene.events.on('enemy-killed', this.handleEnemyKilled, this);
    this.connectInventoryEvents(scene);
  }

  connectInventoryEvents(scene) {
    INVENTORY_ITEMS.forEach((item) => {
      scene.events.on(
        item.event,
        () => {
          this.inventorySystem.refresh();
          if (!this.inventorySystem.getIsOpen() && !this.isSettingsOpen) {
            this.backpackButton.pulse();
          }
        },
        this,
      );
    });
  }

  cleanupEvents() {
    this.gameScenes.forEach((sceneKey) => {
      const scene = this.scene.get(sceneKey);
      if (scene) this.disconnectSceneEvents(scene);
    });
  }

  // --- EVENT HANDLERS ---

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
    this.registry.set('score', this.score);
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

  // --- GAME OVER ---

  triggerGameOver() {
    this.gameOverScreen = new GameOverScreen(this, this.score, () => {
      this.restartGame();
    });
    this.gameOverScreen.create();
    this.pauseGameScenes();
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
    INVENTORY_ITEMS.forEach((item) => this.registry.set(item.regKey, false));
    this.registry.set('isEvening', false);
    this.registry.set('score', 0);
  }

  stopAllGameScenes() {
    this.gameScenes.forEach((key) => {
      this.scene.stop(key);
    });
  }
}
