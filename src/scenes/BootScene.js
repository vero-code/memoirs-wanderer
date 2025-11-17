// src/scenes/BootScene.js
import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  // preload() {
        // shown during the Preloader
    // }

  create() {
    this.scene.start('PreloaderScene');
  }
}
