// src/scenes/PreloaderScene.js
import Phaser from "phaser";

export default class PreloaderScene extends Phaser.Scene {
  constructor() {
    super("PreloaderScene");
  }

  preload() {
    const a = this.add.graphics();
    a.fillStyle(0x000000, 0.5);
    a.fillRect(200, 290, 400, 20);

    const loadingBar = this.add.graphics();
    this.load.on("progress", (value) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(200, 290, 400 * value, 20);
    });

    this.load.on("complete", () => {
      const enData = this.cache.json.get('locale_en');
      this.registry.set('locale_data', enData);
      this.registry.set('current_lang', 'en');

      loadingBar.destroy();
      a.destroy();

      this.scene.start("GameScene");
    });

    this.load.json('locale_en', 'locales/en.json');
    this.load.json('locale_ru', 'locales/ru.json');
  }
}
