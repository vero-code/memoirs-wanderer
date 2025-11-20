// src/components/SettingsMenu.js
import Phaser from 'phaser';

const CONTROLS_CONFIG = [
  { keys: 'WASD / ⬆️⬇️⬅️➡️', localeKey: 'uiMove' },
  { keys: 'SPACE', localeKey: 'uiAttack' },
  { keys: 'I / Mouse 🖱️', localeKey: 'uiInventory' },
  { keys: 'Esc', localeKey: 'uiClose' },
];

export class SettingsMenu {
  constructor(scene, onLanguageToggle) {
    this.scene = scene;
    this.onLanguageToggle = onLanguageToggle;

    this.container = null;
    this.isOpen = false;

    this.titleText = null;
    this.langText = null;
    this.controlTexts = [];
  }

  create() {
    this.container = this.scene.add.container(400, 300);
    this.container.setDepth(201);
    this.container.setVisible(false);

    this.createBackground();
    this.createTitle();
    this.createLanguageButton();
    this.createControlsSection();
  }

  createBackground() {
    const bg = this.scene.add.rectangle(0, 0, 320, 350, 0x1a1a1a, 0.95);
    bg.setStrokeStyle(2, 0xffffff);
    this.container.add(bg);
  }

  createTitle() {
    this.titleText = this.scene.add
      .text(0, -140, this.getText('uiSettings'), {
        fontSize: '24px',
        fontStyle: 'bold',
        fill: '#ffffff',
      })
      .setOrigin(0.5);
    this.container.add(this.titleText);
  }

  createLanguageButton() {
    const currentLang = this.scene.registry.get('current_lang') || 'en';

    this.langText = this.scene.add
      .text(
        0,
        -90,
        `${this.getText('uiLanguage')}: ${currentLang.toUpperCase()}`,
        {
          fontSize: '20px',
          fill: '#ffff00',
          backgroundColor: '#333333',
          padding: { x: 10, y: 5 },
        },
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleLanguage());

    this.langText.on('pointerover', () => {
      this.langText.setStyle({ fill: '#ffffff' });
    });

    this.langText.on('pointerout', () => {
      this.langText.setStyle({ fill: '#ffff00' });
    });

    this.container.add(this.langText);
  }

  createControlsSection() {
    let yPos = -30;
    this.controlTexts = [];

    CONTROLS_CONFIG.forEach((ctrl) => {
      const keyText = this.scene.add.text(-140, yPos, ctrl.keys, {
        fontSize: '16px',
        fill: '#AAAAAA',
      });

      const actionText = this.scene.add
        .text(140, yPos, this.getText(ctrl.localeKey), {
          fontSize: '16px',
          fill: '#FFFFFF',
        })
        .setOrigin(1, 0);

      actionText.setData('localeKey', ctrl.localeKey);

      this.controlTexts.push(actionText);
      this.container.add([keyText, actionText]);

      yPos += 40;
    });
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);
  }

  toggleLanguage() {
    const current = this.scene.registry.get('current_lang');
    const next = current === 'en' ? 'ru' : 'en';

    this.scene.registry.set('current_lang', next);

    const newData = this.scene.cache.json.get(`locale_${next}`);
    if (newData) {
      this.scene.registry.set('locale_data', newData);
    }

    this.updateTexts();

    if (this.onLanguageToggle) {
      this.onLanguageToggle();
    }
  }

  updateTexts() {
    const lang = this.scene.registry.get('current_lang') || 'en';

    if (this.titleText) {
      this.titleText.setText(this.getText('uiSettings'));
    }

    if (this.langText) {
      this.langText.setText(
        `${this.getText('uiLanguage')}: ${lang.toUpperCase()}`,
      );
    }

    if (this.controlTexts) {
      this.controlTexts.forEach((textObj) => {
        const key = textObj.getData('localeKey');
        if (key) {
          textObj.setText(this.getText(key));
        }
      });
    }
  }

  getText(key) {
    const localeData = this.scene.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  getIsOpen() {
    return this.isOpen;
  }
}