// src/scenes/UIScene.js
import Phaser from 'phaser';
import { HealthDisplay } from '../components/HealthDisplay.js';

const INVENTORY_ITEMS = [
  {
    id: 'diary',
    regKey: 'hasDiary',
    label: 'uiDiary',
    texture: 'town_sheet',
    frame: 10,
    color: '#FFFF00',
    event: 'get-diary',
  },
  {
    id: 'armor',
    regKey: 'hasArmor',
    label: 'uiArmor',
    texture: 'town_sheet',
    frame: 5,
    color: '#00FFFF',
    event: 'get-armor',
  },
  {
    id: 'potato',
    regKey: 'hasPotato',
    label: 'uiPotato',
    texture: 'town_sheet',
    frame: 25,
    color: '#FFA500',
    event: 'get-potato',
  },
];

export default class UIScene extends Phaser.Scene {
  dialogText;
  scoreText;
  langButton;
  darknessOverlay;
  healthDisplay;

  // Game Over
  gameOverText;
  finalScoreText;
  restartButton;

  // Inventory
  inventoryContainer;
  isInventoryOpen = false;
  inventorySlots = [];

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
    this.createHealthDisplay();

    this.createInventorySystem();

    this.createLanguageButton();
    this.createDarknessOverlay();
    this.applyInitialTimeOfDay();

    this.connectGameSceneEvents();

    this.input.keyboard.on('keydown-I', () => {
      this.toggleInventory();
    });
  }

  resetState() {
    this.score = this.registry.get('score') || 0;
    if (this.scoreText) {
      this.scoreText.setText(`${this.getText('uiScore')}${this.score}`);
    }
    this.gameOverText = null;
    this.finalScoreText = null;
    this.restartButton = null;
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  // --- CREATING AN INTERFACE ---

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
      .text(400, 20, `${this.getText('uiScore')}${this.score}`, {
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

  // --- NEW INVENTORY SYSTEM ---

  createInventorySystem() {
    this.inventoryContainer = this.add.container(400, 300);
    this.inventoryContainer.setDepth(200);
    this.inventoryContainer.setVisible(false);

    const bg = this.add.rectangle(0, 0, 300, 200, 0x222222, 0.9);
    bg.setStrokeStyle(2, 0xffffff);
    this.inventoryContainer.add(bg);

    const title = this.add
      .text(0, -80, 'INVENTORY', { fontSize: '20px', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.inventoryContainer.add(title);

    const startX = -100;
    const startY = -40;
    const slotSize = 50;
    const gap = 10;

    for (let i = 0; i < 8; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = startX + col * (slotSize + gap);
      const y = startY + row * (slotSize + gap);
      const slot = this.add.rectangle(x, y, slotSize, slotSize, 0x000000, 0.5);
      slot.setStrokeStyle(1, 0x666666);
      this.inventoryContainer.add(slot);
      this.inventorySlots.push({ x, y });
    }

    this.refreshInventory();
  }

  toggleInventory() {
    this.isInventoryOpen = !this.isInventoryOpen;
    this.inventoryContainer.setVisible(this.isInventoryOpen);
    if (this.isInventoryOpen) {
      this.refreshInventory();
    }
  }

  refreshInventory() {
    this.inventoryContainer.each((child) => {
      if (child.name === 'itemIcon') child.destroy();
    });

    let slotIndex = 0;

    INVENTORY_ITEMS.forEach((item) => {
      if (
        this.registry.get(item.regKey) &&
        slotIndex < this.inventorySlots.length
      ) {
        const slot = this.inventorySlots[slotIndex];

        const icon = this.add.image(slot.x, slot.y, item.texture, item.frame);
        icon.setDisplaySize(32, 32);
        icon.setName('itemIcon');
        this.inventoryContainer.add(icon);

        slotIndex++;
      }
    });
  }

  // --- LANGUAGE AND SETTINGS ---

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

    // TODO: Update tooltips for inventory items

    if (this.gameOverText) this.gameOverText.setText(this.getText('uiYouDied'));
    if (this.finalScoreText)
      this.finalScoreText.setText(
        `${this.getText('uiFinalScore')}${this.score}`,
      );
    if (this.restartButton)
      this.restartButton.setText(this.getText('uiRestart'));
  }

  // --- EFFECTS ---

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
      this.gameScenes.forEach((sceneKey) => {
        const scene = this.scene.get(sceneKey);
        if (scene) this.disconnectSceneEvents(scene);
      });
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

    INVENTORY_ITEMS.forEach((item) => {
      scene.events.on(
        item.event,
        () => {
          this.refreshInventory();
          // If the inventory is closed, show a notification
          if (!this.isInventoryOpen) {
             // this.showNotification(...)
          }
        },
        this,
      );
    });
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

  // Deprecated
  pulseIcon(target) {
    target.setAlpha(1);
    this.tweens.add({
      targets: target,
      alpha: 0.2,
      duration: 300,
      ease: 'Linear',
      yoyo: true,
      repeat: 3,
      onComplete: () => target.setAlpha(1),
    });
  }

  // --- GAME OVER LOGIC ---
  
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
