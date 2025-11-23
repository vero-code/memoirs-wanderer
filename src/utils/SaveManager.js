// src/utils/SaveManager.js

const SAVE_KEY = 'memoirs_wanderer_save_v1';

const KEYS_TO_SAVE = [
  'score',
  'playerHealth',
  'current_lang',
  'isEvening',
  // Inventory
  'hasDiary',
  'hasArmor',
  'hasPotato',
  'hasStone',
  // Plot
  'dayCount',
  'itemsLost',
  'hasEnteredTown',
  'receivedFreePotato',
  'playerCoins'
];

export const SaveManager = {
  save: (scene) => {
    const data = {};
    
    KEYS_TO_SAVE.forEach((key) => {
      const value = scene.registry.get(key);
      if (value !== undefined) {
        data[key] = value;
      }
    });

    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(SAVE_KEY, serialized);
      console.log('Game Saved!', data);
    } catch (e) {
      console.warn('Failed to save game:', e);
    }
  },

  load: (scene) => {
    try {
      const serialized = localStorage.getItem(SAVE_KEY);
      if (serialized) {
        const data = JSON.parse(serialized);
        
        Object.keys(data).forEach((key) => {
          scene.registry.set(key, data[key]);
        });
        
        console.log('Game Loaded!', data);
        return true;
      }
    } catch (e) {
      console.warn('Failed to load game:', e);
    }
    return false;
  },

  clear: () => {
    localStorage.removeItem(SAVE_KEY);
    console.log('Save deleted.');
  }
};