// src/scenes/BootScene.js
import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.add
      .text(400, 300, "Hello, Wanderer! (from Vite)", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }
}
