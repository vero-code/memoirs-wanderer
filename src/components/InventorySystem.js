// src/components/InventorySystem.js
import Phaser from 'phaser';

export const INVENTORY_ITEMS = [
  {
    id: 'diary',
    regKey: 'hasDiary',
    label: 'uiDiary',
    emoji: '📔',
    event: 'get-diary',
  },
  {
    id: 'armor',
    regKey: 'hasArmor',
    label: 'uiArmor',
    emoji: '🛡️',
    event: 'get-armor',
  },
  {
    id: 'potato',
    regKey: 'hasPotato',
    label: 'uiPotato',
    emoji: '🥔',
    event: 'get-potato',
  },
  {
    id: 'stone',
    regKey: 'hasStone',
    label: 'uiStone',
    emoji: '🪨',
    event: 'get-stone',
  },
];

export class InventorySystem {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.slots = [];
    this.tooltipText = null;
    this.isOpen = false;
  }

  create() {
    this.container = this.scene.add.container(400, 300);
    this.container.setDepth(200);
    this.container.setVisible(false);

    this.createBackground();
    this.createTitle();
    this.createSlots();
    this.createTooltip();
  }

  createBackground() {
    const bg = this.scene.add.rectangle(0, 0, 300, 200, 0x222222, 0.9);
    bg.setStrokeStyle(2, 0xffffff);
    this.container.add(bg);
  }

  createTitle() {
    const title = this.scene.add
      .text(0, -80, 'INVENTORY', {
        fontSize: '22px',
        fontStyle: 'bold',
        fill: '#ffffff',
      })
      .setOrigin(0.5);
    this.container.add(title);
  }

  createSlots() {
    const startX = -100;
    const startY = -40;
    const slotSize = 50;
    const gap = 10;

    for (let i = 0; i < 8; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = startX + col * (slotSize + gap);
      const y = startY + row * (slotSize + gap);

      const slot = this.scene.add.rectangle(
        x,
        y,
        slotSize,
        slotSize,
        0x000000,
        0.5,
      );
      slot.setStrokeStyle(1, 0x666666);
      this.container.add(slot);
      this.slots.push({ x, y });
    }
  }

  createTooltip() {
    this.tooltipText = this.scene.add
      .text(0, 80, '', {
        fontSize: '16px',
        fill: '#ffff00',
        fontStyle: 'italic',
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

    const icon = this.scene.add
      .text(slot.x, slot.y, item.emoji, {
        fontSize: '32px',
        padding: { x: 0, y: 0 },
      })
      .setOrigin(0.5);

    icon.setName('itemIcon');
    icon.setInteractive({ useHandCursor: true });

    icon.on('pointerover', () => {
      const localizedName = this.getText(item.label);
      this.tooltipText.setText(localizedName);
      icon.setScale(1.2);
    });

    icon.on('pointerout', () => {
      this.tooltipText.setText('');
      icon.setScale(1);
    });

    this.container.add(icon);

    if (typeof count === 'number' && count > 1) {
      const countText = this.scene.add
        .text(slot.x + 20, slot.y + 20, count.toString(), {
          fontSize: '14px',
          fontStyle: 'bold',
          fill: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        })
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
}
