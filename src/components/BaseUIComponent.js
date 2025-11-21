// src/components/BaseUIComponent.js
import Phaser from 'phaser';

/**
 * Base class for UI components with common functionality
 */
export class BaseUIComponent {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isOpen = false;
  }

  /**
   * Get localized text by key
   * @param {string} key - Locale key
   * @returns {string} Localized text or key if not found
   */
  getText(key) {
    const localeData = this.scene.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  /**
   * Check if component is currently open
   * @returns {boolean}
   */
  getIsOpen() {
    return this.isOpen;
  }

  /**
   * Toggle visibility of the component
   * Can be overridden for custom behavior
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);
  }

  /**
   * Create background rectangle with standard styling
   * @param {Object} config - Background configuration
   * @param {number} config.width - Width of background
   * @param {number} config.height - Height of background
   * @param {number} config.color - Background color (hex)
   * @param {number} config.alpha - Background alpha
   * @param {number} config.strokeWidth - Border width
   * @param {number} config.strokeColor - Border color (hex)
   * @returns {Phaser.GameObjects.Rectangle}
   */
  createBackground(config) {
    const { width, height, color, alpha, strokeWidth, strokeColor } = config;
    const bg = this.scene.add.rectangle(0, 0, width, height, color, alpha);
    bg.setStrokeStyle(strokeWidth, strokeColor);
    return bg;
  }

  /**
   * Create container at specified position and depth
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} depth - Display depth
   * @returns {Phaser.GameObjects.Container}
   */
  createContainer(x, y, depth) {
    this.container = this.scene.add.container(x, y);
    this.container.setDepth(depth);
    this.container.setVisible(false);
    return this.container;
  }

  /**
   * Update all text elements with current locale
   * Must be implemented by child classes
   */
  updateTexts() {
    throw new Error('updateTexts() must be implemented by child class');
  }
}
