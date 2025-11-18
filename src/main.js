// src/main.js
import Phaser from "phaser";
import config from "./config.js";
import BootScene from "./scenes/BootScene.js";
import PreloaderScene from './scenes/PreloaderScene.js';
import GameScene from './scenes/GameScene.js';
import ForestScene from './scenes/ForestScene.js';
import UIScene from './scenes/UIScene.js';

const game = new Phaser.Game(
  Object.assign(config, {
    scene: [BootScene, PreloaderScene, GameScene, ForestScene, UIScene],
  })
);
