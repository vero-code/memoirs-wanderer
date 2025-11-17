// src/main.js
import Phaser from "phaser";
import config from "./config.js";
import BootScene from "./scenes/BootScene.js";

const game = new Phaser.Game(
  Object.assign(config, {
    scene: [BootScene],
  })
);
