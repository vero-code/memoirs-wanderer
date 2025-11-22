// src/components/SettingsMenu.js
import Phaser from 'phaser';
import { BaseUIComponent } from './BaseUIComponent.js';
import { SaveManager } from '../utils/SaveManager.js';
import {
  SETTINGS_LAYOUT,
  SETTINGS_STYLES,
  CONTROLS_CONFIG,
} from '../config/settingsConfig.js';

export class SettingsMenu extends BaseUIComponent {
  constructor(scene, onLanguageToggle) {
    super(scene, SETTINGS_LAYOUT, SETTINGS_STYLES);
    this.onLanguageToggle = onLanguageToggle;
    this.titleText = null;
    this.langText = null;
    this.controlTexts = [];
    this.resetButton = null;
  }

  create() {
    this.createContainer(
      SETTINGS_LAYOUT.position.x,
      SETTINGS_LAYOUT.position.y,
      SETTINGS_LAYOUT.depth,
    );

    const bg = this.createBackground(SETTINGS_LAYOUT.background);
    this.container.add(bg);

    this.createTitle();
    this.createLanguageButton();
    this.createControlsSection();
    this.createResetButton();
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
    SaveManager.save(this.scene);
  }

  createResetButton() {
    const styles = this.styles || {};
    console.log(styles);
    const style = styles.resetButton || {};
    const fontSize = style.fontSize || '20px';
    const fill = style.fill || '#44e3ffff';
    const hover = style.fillHover || '#00ccffff';
    const y = style.offsetY || 200;

    this.resetButton = this.scene.add
      .text(0, y, this.getText('uiStartOver'), {
        fontSize: fontSize,
        fontStyle: 'bold',
        fill: fill,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.resetButton.on('pointerover', () => {
      this.resetButton.setStyle({ fill: hover });
    });

    this.resetButton.on('pointerout', () => {
      this.resetButton.setStyle({ fill: fill });
    });

    this.resetButton.on('pointerdown', () => {
      const confirmed = window.confirm(
        this.getText('uiStartOverConfirm') || 'Reset game?',
      );
      if (confirmed) {
        SaveManager.clear();
        window.location.reload();
      }
    });

    this.container.add(this.resetButton);
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

    if (this.resetButton) {
      this.resetButton.setText(this.getText('uiStartOver'));
    }
  }
}
