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
      loadingBar.destroy();
      a.destroy();

      this.scene.start("GameScene");
    });
  }
}
