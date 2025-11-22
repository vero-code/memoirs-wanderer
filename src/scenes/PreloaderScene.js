// src/scenes/PreloaderScene.js
import Phaser from 'phaser';

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

      const currentLang = this.registry.get('current_lang') || 'en';
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
  }
}
