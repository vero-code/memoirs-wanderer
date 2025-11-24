// src/config/settingsConfig.js

/**
 * Settings Menu Visual Configuration
 * Contains layout, styling, and control mappings for the settings menu
 */

export const SETTINGS_LAYOUT = {
  position: { x: 400, y: 300 },
  depth: 201,
  background: {
    width: 320,
    height: 350,
    color: 0x1a1a1a,
    alpha: 0.95,
    strokeWidth: 2,
    strokeColor: 0xffffff,
  },
};

export const SETTINGS_STYLES = {
  title: {
    fontSize: '24px',
    fontStyle: 'bold',
    fill: '#ffffff',
    offsetY: -140,
  },
  languageButton: {
    fontSize: '18px',
    fill: '#ffff00',
    fillHover: '#ffffff',
    backgroundColor: '#333333',
    padding: { x: 10, y: 0 },
    offsetY: -90,
  },
  controlKeys: {
    fontSize: '16px',
    fill: '#AAAAAA',
    offsetX: -140,
  },
  controlActions: {
    fontSize: '16px',
    fill: '#FFFFFF',
    offsetX: 140,
  },
  controlSpacing: 40,
  controlStartY: -50,
  resetButton: {
    fontSize: '16px',
    fontStyle: 'bold',
    fill: '#ff4444',
    fillHover: '#ff0000',
    offsetY: 150,
  },
  closeButton: {
    text: '✕',
    fontSize: '18px',
    fontStyle: 'bold',
    fill: '#ffffff',
    fillHover: '#ff4444',
    x: 140,
    y: -155,
  },
};

export const CONTROLS_CONFIG = [
  { keys: 'WASD / ⬆️⬇️⬅️➡️', localeKey: 'uiMove' },
  { keys: 'SPACE', localeKey: 'uiAttack' },
  { keys: 'I / Mouse 🖱️', localeKey: 'uiInventory' },
  { keys: 'J', localeKey: 'uiDiarySettings' },
  { keys: 'Esc', localeKey: 'uiClose' },
];
