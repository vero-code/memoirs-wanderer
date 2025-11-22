// src/config/inventoryConfig.js

/**
 * Inventory System Visual Configuration
 * Contains layout, styling, and item definitions for the inventory system
 */

export const INVENTORY_LAYOUT = {
  position: { x: 400, y: 300 },
  depth: 200,
  background: {
    width: 360,
    height: 300,
    color: 0x222222,
    alpha: 0.9,
    strokeWidth: 2,
    strokeColor: 0xffffff,
  },
};

export const INVENTORY_STYLES = {
  title: {
    fontSize: '22px',
    fontStyle: 'bold',
    fill: '#ffffff',
    offsetY: -100,
  },
  tooltip: {
    fontSize: '16px',
    fill: '#ffff00',
    fontStyle: 'italic',
    offsetY: 115,
  },
  itemIcon: {
    fontSize: '32px',
    padding: { x: 10, y: 10 },
    hoverScale: 1.2,
    normalScale: 1,
  },
  itemCount: {
    fontSize: '14px',
    fontStyle: 'bold',
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 3,
    offsetX: 20,
    offsetY: 20,
  },
};

export const INVENTORY_SLOTS = {
  total: 8,
  columns: 4,
  size: 60,
  gap: 15,
  startY: -20,
  slotColor: 0x000000,
  slotAlpha: 0.5,
  slotStrokeWidth: 1,
  slotStrokeColor: 0x666666,
};

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
