// src/components/SettingsMenu.js
import Phaser from 'phaser';
import {
  SETTINGS_LAYOUT,
  SETTINGS_STYLES,
  CONTROLS_CONFIG,
} from '../config/settingsConfig.js';

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
    this.container = this.scene.add.container(
      SETTINGS_LAYOUT.position.x,
      SETTINGS_LAYOUT.position.y,
    );
    this.container.setDepth(SETTINGS_LAYOUT.depth);
    this.container.setVisible(false);

    this.createBackground();
    this.createTitle();
    this.createLanguageButton();
    this.createControlsSection();
  }

  createBackground() {
    const { width, height, color, alpha, strokeWidth, strokeColor } =
      SETTINGS_LAYOUT.background;

    const bg = this.scene.add.rectangle(0, 0, width, height, color, alpha);
    bg.setStrokeStyle(strokeWidth, strokeColor);
    this.container.add(bg);
  }

  createTitle() {
    const style = SETTINGS_STYLES.title;

    this.titleText = this.scene.add
      .text(0, style.offsetY, this.getText('uiSettings'), {
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fill: style.fill,
      })
      .setOrigin(0.5);
    this.container.add(this.titleText);
  }

  createLanguageButton() {
    const currentLang = this.scene.registry.get('current_lang') || 'en';
    const style = SETTINGS_STYLES.languageButton;

    this.langText = this.scene.add
      .text(
        0,
        style.offsetY,
        `${this.getText('uiLanguage')}: ${currentLang.toUpperCase()}`,
        {
          fontSize: style.fontSize,
          fill: style.fill,
          backgroundColor: style.backgroundColor,
          padding: style.padding,
        },
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleLanguage());

    this.langText.on('pointerover', () => {
      this.langText.setStyle({ fill: style.fillHover });
    });

    this.langText.on('pointerout', () => {
      this.langText.setStyle({ fill: style.fill });
    });

    this.container.add(this.langText);
  }

  createControlsSection() {
    let yPos = SETTINGS_STYLES.controlStartY;
    this.controlTexts = [];

    const keyStyle = SETTINGS_STYLES.controlKeys;
    const actionStyle = SETTINGS_STYLES.controlActions;

    CONTROLS_CONFIG.forEach((ctrl) => {
      const keyText = this.scene.add.text(keyStyle.offsetX, yPos, ctrl.keys, {
        fontSize: keyStyle.fontSize,
        fill: keyStyle.fill,
      });

      const actionText = this.scene.add
        .text(actionStyle.offsetX, yPos, this.getText(ctrl.localeKey), {
          fontSize: actionStyle.fontSize,
          fill: actionStyle.fill,
        })
        .setOrigin(1, 0);

      actionText.setData('localeKey', ctrl.localeKey);

      this.controlTexts.push(actionText);
      this.container.add([keyText, actionText]);

      yPos += SETTINGS_STYLES.controlSpacing;
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
