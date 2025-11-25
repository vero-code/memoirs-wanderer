// src/scenes/PreloaderScene.js
import Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager.js';

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  preload() {
    const a = this.add.graphics();
    a.fillStyle(0x000000, 0.5);
    a.fillRect(200, 290, 400, 20);

    const loadingBar = this.add.graphics();
    this.load.on('progress', (value) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(200, 290, 400 * value, 20);
    });

    this.load.on('complete', () => {
      loadingBar.destroy();
      a.destroy();

      SaveManager.load(this);

      let currentLang = this.registry.get('current_lang');
      if (!currentLang) {
        currentLang = 'en';
        this.registry.set('current_lang', 'en');
      }

      const localeData = this.cache.json.get(`locale_${currentLang}`);
      this.registry.set('locale_data', localeData);

      this.scene.start('TitleScene');
    });

    this.load.json('locale_en', 'locales/en.json');
    this.load.json('locale_ru', 'locales/ru.json');

    this.load.image('tiles_dungeon', 'assets/tilesets/tiny_dungeon_tiles.png');
    this.load.tilemapTiledJSON(
      'map_dungeon',
      'assets/tilesets/dungeon_map.json',
    );

    this.load.tilemapTiledJSON('map_forest', 'assets/tilesets/forest_map.json');

    this.load.spritesheet(
      'player_sheet',
      'assets/tilesets/tiny_dungeon_tiles.png',
      {
        frameWidth: 16,
        frameHeight: 16,
        spacing: 1,
      },
    );

    this.load.spritesheet('town_sheet', 'assets/tilesets/tiny_town_tiles.png', {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 1,
    });

    this.load.spritesheet('tiny_ski', 'assets/tilesets/tiny_ski.png', {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 1,
    });

    this.load.spritesheet('battle_sheet', 'assets/tilesets/tiny_battle_tiles.png', {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 1
    });

    this.load.audio('sfx_door_open', 'assets/audio/doorOpen_2.ogg');
    this.load.audio('sfx_step', 'assets/audio/footstep04.ogg');
    this.load.audio('sfx_diary', 'assets/audio/cloth4.ogg');
    this.load.audio('sfx_page', 'assets/audio/bookFlip2.ogg');
    this.load.audio('sfx_coin', 'assets/audio/handleCoins.ogg');
    this.load.audio('sfx_mine', 'assets/audio/metalLatch.ogg');
    this.load.audio('sfx_stone_break', 'assets/audio/metalClick.ogg');
    this.load.audio('sfx_bag', 'assets/audio/dropLeather.ogg');
    this.load.audio('sfx_click', 'assets/audio/switch_001.ogg');
    this.load.audio('sfx_lose', 'assets/audio/jingles_SAX07.ogg');
    this.load.audio('sfx_hurt', 'assets/audio/laser1.ogg');
    this.load.audio('sfx_item_get', 'assets/audio/impactGlass_heavy_001.ogg');
    this.load.audio('sfx_eat', 'assets/audio/card-shuffle.ogg');
    this.load.audio('sfx_cliff', 'assets/audio/dice-shake-2.ogg');
    this.load.audio('sfx_attack', 'assets/audio/drawKnife2.ogg');
  }
}
