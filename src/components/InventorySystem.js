// src/components/InventorySystem.js
import Phaser from 'phaser';
import { BaseUIComponent } from './BaseUIComponent.js';
import {
  INVENTORY_LAYOUT,
  INVENTORY_STYLES,
  INVENTORY_SLOTS,
  INVENTORY_ITEMS,
} from '../config/inventoryConfig.js';

export { INVENTORY_ITEMS };

export class InventorySystem extends BaseUIComponent {
  constructor(scene) {
    super(scene);
    this.slots = [];
    this.tooltipText = null;
  }

  create() {
    this.createContainer(
      INVENTORY_LAYOUT.position.x,
      INVENTORY_LAYOUT.position.y,
      INVENTORY_LAYOUT.depth,
    );

    const bg = this.createBackground(INVENTORY_LAYOUT.background);
    this.container.add(bg);

    this.createTitle();
    this.createSlots();
    this.createTooltip();
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
      startY,
      slotColor,
      slotAlpha,
      slotStrokeWidth,
      slotStrokeColor,
    } = INVENTORY_SLOTS;

    const rowWidth = columns * size + (columns - 1) * gap;
    const calculatedStartX = -(rowWidth / 2) + size / 2;

    for (let i = 0; i < total; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = calculatedStartX + col * (size + gap);
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
    super.toggle();

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

    icon.on('pointerdown', () => {
      this.scene.events.emit('inventory-item-use', item);
      this.scene.tweens.add({
        targets: icon,
        scale: 0.8,
        duration: 50,
        yoyo: true,
      });
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
