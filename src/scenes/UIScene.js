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
import { SaveManager } from '../utils/SaveManager.js';
import { DiarySystem } from '../components/DiarySystem.js';

export default class UIScene extends Phaser.Scene {
  // UI Components
  dialogText;
  dayText;
  darknessOverlay;

  // Component instances
  healthDisplay;
  inventorySystem;
  diarySystem;
  backpackButton;
  settingsButton;
  settingsMenu;
  gameOverScreen;

  // State
  gameScenes = ['GameScene', 'ForestScene'];
  initialIsEvening = false;
  initialAnimated = false;

  constructor() {
    super('UIScene');
  }

  init(data) {
    this.initialIsEvening = data?.isEvening || false;
    this.initialAnimated = data?.animated !== undefined ? data.animated : false;
    this.initialLocationKey = data?.locationKey || '';
  }

  create() {
    this.resetState();
    this.createUI();
    this.createComponents();
    this.createDarknessOverlay();
    this.applyInitialTimeOfDay();
    this.connectGameSceneEvents();
    this.setupKeyboardShortcuts();
    this.events.off('inventory-item-use');
    this.events.on('inventory-item-use', this.handleItemUse, this);
    if (this.initialLocationKey && this.locationText) {
      this.setLocation(this.initialLocationKey);
    }
  }

  resetState() {
    this.dayCount = this.registry.get('dayCount') || 1;
    this.coins = this.registry.get('playerCoins') || 0;
    this.gameOverScreen = null;
    this.currentLocationKey = null;
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  // --- UI CREATION ---

  createUI() {
    this.createDialogText();
    this.createDayText();
    this.createCoinText();
    this.createLocationText();
    this.createVersionText();
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

  createDayText() {
    const day = this.registry.get('dayCount') || 1;

    this.dayText = this.add
      .text(400, 20, `${this.getText('uiDay')} ${day}`, {
        fontSize: '18px',
        fill: '#f3f3f3ff',
        stroke: '#000000',
        strokeThickness: 4,
        fontFamily: 'monospace',
      })
      .setOrigin(0.5, 0)
      .setDepth(100);
  }

  createCoinText() {
    this.coinText = this.add
      .text(640, 35, `🪙 ${this.coins}`, {
        fontSize: '24px',
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(1, 0.5);
    this.coinText.setDepth(100);
  }

  createLocationText() {
    this.locationText = this.add
      .text(20, 60, '', {
        fontFamily: 'serif',
        fontSize: '18px',
        fontStyle: 'italic',
        fill: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setDepth(100);
  }

  createVersionText() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.versionText = this.add
      .text(width - 10, height - 10, this.getText('uiCredits'), {
        fontSize: '12px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        alpha: 0.5,
      })
      .setOrigin(1, 1)
      .setDepth(90);
  }

  createComponents() {
    // Health Display
    this.healthDisplay = new HealthDisplay(this, 3);

    // Inventory System
    this.inventorySystem = new InventorySystem(this);
    this.inventorySystem.create();

    this.diarySystem = new DiarySystem(this);
    this.diarySystem.create();

    // Backpack Button
    this.backpackButton = new BackpackButton(this, 690, 35, () => {
      this.sound.play('sfx_click');
      this.inventorySystem.toggle();
      if (this.settingsMenu.getIsOpen()) {
        this.settingsMenu.toggle();
      }
    });

    // Settings Button
    this.settingsButton = new SettingsButton(this, 755, 35, () => {
      this.sound.play('sfx_click');
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
      } else if (this.diarySystem.getIsOpen()) {
        this.diarySystem.toggle();
      }
    });

    this.input.keyboard.on('keydown-F9', () => {
      SaveManager.clear();
      location.reload();
    });

    this.input.keyboard.on('keydown-J', () => {
      if (!this.settingsMenu.getIsOpen()) {
        const hasDiary = this.registry.get('hasDiary');
        if (hasDiary) {
          this.sound.play('sfx_diary');
          if (this.inventorySystem.getIsOpen()) {
            this.inventorySystem.toggle();
          }
          if (this.diarySystem) {
            this.diarySystem.toggle();
          }
        }
      }
    });

    // --- DEV MODE ---
    this.input.keyboard.on('keydown-F2', () => {
      this.registry.set('hasDiary', true);
      this.registry.set('receivedDiary', true);
      this.events.emit('get-diary');

      let currentPotato = this.registry.get('hasPotato');
      if (typeof currentPotato !== 'number') currentPotato = 0;
      this.registry.set('hasPotato', currentPotato + 1);
      this.registry.set('receivedFreePotato', true);
      this.events.emit('get-potato');

      this.registry.set('isEvening', true);
      this.handleSetTime('dusk');

      SaveManager.save(this);
    });

    this.input.keyboard.on('keydown-F4', () => {
      this.scene.stop('GameScene');
      this.scene.start('ForestScene');
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
    this.coins = this.registry.get('playerCoins') || 0;

    const day = this.registry.get('dayCount') || 1;
    this.dayText.setText(`${this.getText('uiDay')} ${day}`);

    if (this.coinText) this.coinText.setText(`🪙 ${this.coins}`);

    if (this.locationText && this.currentLocationKey) {
      this.locationText.setText(this.getText(this.currentLocationKey));
    }

    if (this.gameOverScreen) this.gameOverScreen.updateTexts();
    if (this.inventorySystem) {
      this.inventorySystem.clearTooltip();
      this.inventorySystem.updateTexts();
    }
    if (this.diarySystem) this.diarySystem.updateTexts();

    if (this.versionText) this.versionText.setText(this.getText('uiCredits'));

    SaveManager.save(this);
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
          SaveManager.save(this);
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
    this.sound.play('sfx_hurt', { volume: 0.5 });
    const isDead = this.healthDisplay.takeDamage();
    SaveManager.save(this);
    if (isDead) {
      this.game.sound.stopAll();
      this.sound.play('sfx_lose', { volume: 0.6 });
      this.triggerGameOver();
    }
  }

  handleEnemyKilled() {
    SaveManager.save(this);
  }

  handleItemUse(item) {
    if (item.id === 'potato') {
      const healed = this.healthDisplay.heal(1);
      if (healed) {
        this.sound.play('sfx_eat');
        const currentCount = this.registry.get('hasPotato');
        const newCount = currentCount - 1;
        this.registry.set('hasPotato', newCount > 0 ? newCount : false);
        this.inventorySystem.refresh();
      } else {
        this.handleShowDialog(this.getText('hpFull') || 'HP Full!');
        this.time.delayedCall(1000, () => this.handleHideDialog());
      }
    }
    if (item.id === 'diary') {
      if (this.diarySystem) {
        this.sound.play('sfx_diary');
        this.inventorySystem.toggle();
        this.diarySystem.toggle();
      }
    }
  }

  animateCoinGain(amount) {
    this.updateUITexts();
    this.sound.play('sfx_coin', { volume: 0.5 });

    this.tweens.add({
      targets: this.coinText,
      scale: 1.5,
      duration: 100,
      yoyo: true,
    });
  }

  setLocation(key) {
    this.currentLocationKey = key;

    const text = this.getText(key);

    if (this.locationText.text === text) return;

    this.locationText.setText(text);
    this.locationText.setAlpha(0);
    this.locationText.y = 70;

    this.tweens.add({
      targets: this.locationText,
      y: 60,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });
  }

  // --- GAME OVER ---

  triggerGameOver() {
    this.gameOverScreen = new GameOverScreen(this, () => {
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
    SaveManager.clear();

    this.registry.set('score', 0);
    this.registry.set('playerHealth', 3);
    this.registry.set('isEvening', false);
    this.registry.set('dayCount', 1);
    this.registry.set('playerCoins', 0);

    this.registry.set('hasDiary', false);
    this.registry.set('hasArmor', false);
    this.registry.set('hasPotato', false);
    this.registry.set('hasStone', 0);

    this.registry.set('itemsLost', false);
    this.registry.set('hasEnteredTown', false);
    this.registry.set('receivedFreePotato', false);
    this.registry.set('receivedDiary', false);
    this.registry.set('hasVisitedForest', false);

    this.registry.set('bag_hasDiary', false);
    this.registry.set('bag_hasArmor', false);
    this.registry.set('bag_hasPotato', false);
    this.registry.set('bag_hasStone', 0);

    this.healthDisplay.reset();
    this.stopAllGameScenes();
    this.scene.start('GameScene');
  }

  clearGameState() {
    INVENTORY_ITEMS.forEach((item) => this.registry.set(item.regKey, false));
    this.registry.set('isEvening', false);
  }

  stopAllGameScenes() {
    this.gameScenes.forEach((key) => {
      this.scene.stop(key);
    });
  }
}
