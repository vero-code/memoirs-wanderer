// src/scenes/GameScene.js
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  map;
  player;
  layers = {};

  constructor() {
    super("GameScene");
  }

  create() {
    this.map = this.make.tilemap({ key: "map_dungeon" });
    const tileset = this.map.addTilesetImage("tileset", "tiles_dungeon");
    this.layers.ground = this.map.createLayer("Dungeon", tileset, 0, 0);
    this.layers.objects = this.map.createLayer("Objects", tileset, 0, 0);
    this.player = this.physics.add.sprite(100, 100, "player_sheet", 84);
  }

  update(time, delta) {
    // game loop, executed every frame
    // contain the character movement logic, enemy AI, etc.
  }
}
