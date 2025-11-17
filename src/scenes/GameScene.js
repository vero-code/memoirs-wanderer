// src/scenes/GameScene.js
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.add
      .text(400, 300, "Game Begins!", {
        fontSize: "32px",
        color: "#00ff00",
      })
      .setOrigin(0.5);
  }

  update(time, delta) {
    // game loop, executed every frame
    // contain the character movement logic, enemy AI, etc.
  }
}
