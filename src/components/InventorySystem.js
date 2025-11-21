// src/components/InventorySystem.js
import Phaser from 'phaser';
import {
  INVENTORY_LAYOUT,
  INVENTORY_STYLES,
  INVENTORY_SLOTS,
  INVENTORY_ITEMS,
} from '../config/inventoryConfig.js';

export { INVENTORY_ITEMS };

export class InventorySystem {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.slots = [];
    this.tooltipText = null;
    this.isOpen = false;
  }

  create() {
    this.container = this.scene.add.container(
      INVENTORY_LAYOUT.position.x,
      INVENTORY_LAYOUT.position.y,
    );
    this.container.setDepth(INVENTORY_LAYOUT.depth);
    this.container.setVisible(false);

    this.createBackground();
    this.createTitle();
    this.createSlots();
    this.createTooltip();
  }

  createBackground() {
    const { width, height, color, alpha, strokeWidth, strokeColor } =
      INVENTORY_LAYOUT.background;

    const bg = this.scene.add.rectangle(0, 0, width, height, color, alpha);
    bg.setStrokeStyle(strokeWidth, strokeColor);
    this.container.add(bg);
  }

  createTitle() {
    const title = this.getText('uiInventory').toUpperCase();
    const style = INVENTORY_STYLES.title;

    this.titleText = this.scene.add
      .text(0, style.offsetY, title, {
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fill: style.fill,
      })
      .setOrigin(0.5);
    this.container.add(this.titleText);
  }

  createSlots() {
    const {
      total,
      columns,
      size,
      gap,
      startX,
      startY,
      slotColor,
      slotAlpha,
      slotStrokeWidth,
      slotStrokeColor,
    } = INVENTORY_SLOTS;

    for (let i = 0; i < total; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = startX + col * (size + gap);
      const y = startY + row * (size + gap);

      const slot = this.scene.add.rectangle(
        x,
        y,
        size,
        size,
        slotColor,
        slotAlpha,
      );
      slot.setStrokeStyle(slotStrokeWidth, slotStrokeColor);
      this.container.add(slot);
      this.slots.push({ x, y });
    }
  }

  createTooltip() {
    const style = INVENTORY_STYLES.tooltip;

    this.tooltipText = this.scene.add
      .text(0, style.offsetY, '', {
        fontSize: style.fontSize,
        fill: style.fill,
        fontStyle: style.fontStyle,
      })
      .setOrigin(0.5);
    this.container.add(this.tooltipText);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);

    if (this.isOpen) {
      this.refresh();
      this.tooltipText.setText('');
    }
  }

  refresh() {
    this.container.each((child) => {
      if (child.name === 'itemIcon') child.destroy();
      if (child.name === 'itemCount') child.destroy();
    });

    let slotIndex = 0;

    INVENTORY_ITEMS.forEach((item) => {
      if (
        this.scene.registry.get(item.regKey) &&
        slotIndex < this.slots.length
      ) {
        const slot = this.slots[slotIndex];
        this.createItemIcon(slot, item);
        slotIndex++;
      }
    });
  }

  createItemIcon(slot, item) {
    const count = this.scene.registry.get(item.regKey);
    const iconStyle = INVENTORY_STYLES.itemIcon;

    const icon = this.scene.add
      .text(slot.x, slot.y, item.emoji, {
        fontSize: iconStyle.fontSize,
        padding: iconStyle.padding,
      })
      .setOrigin(0.5);

    icon.setName('itemIcon');
    icon.setInteractive({ useHandCursor: true });

    icon.on('pointerover', () => {
      const localizedName = this.getText(item.label);
      this.tooltipText.setText(localizedName);
      icon.setScale(iconStyle.hoverScale);
    });

    icon.on('pointerout', () => {
      this.tooltipText.setText('');
      icon.setScale(iconStyle.normalScale);
    });

    this.container.add(icon);

    if (typeof count === 'number' && count > 1) {
      const countStyle = INVENTORY_STYLES.itemCount;

      const countText = this.scene.add
        .text(
          slot.x + countStyle.offsetX,
          slot.y + countStyle.offsetY,
          count.toString(),
          {
            fontSize: countStyle.fontSize,
            fontStyle: countStyle.fontStyle,
            fill: countStyle.fill,
            stroke: countStyle.stroke,
            strokeThickness: countStyle.strokeThickness,
          },
        )
        .setOrigin(1, 1);

      countText.setName('itemCount');
      this.container.add(countText);
    }
  }

  getText(key) {
    const localeData = this.scene.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  getIsOpen() {
    return this.isOpen;
  }

  clearTooltip() {
    if (this.tooltipText) {
      this.tooltipText.setText('');
    }
  }

  updateTexts() {
    if (this.titleText) {
      const title = this.getText('uiInventory').toUpperCase();
      this.titleText.setText(title);
    }
    if (this.isOpen) {
      this.refresh();
    }
  }
}
