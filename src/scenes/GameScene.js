// src/scenes/GameScene.js
import Phaser from "phaser";
import Player from "../entities/Player.js";

export default class GameScene extends Phaser.Scene {
  map;
  player;
  writer;
  armorer;
  merchant;
  layers = {};

  hasDiary = false;
  justGotDiary = false;

  hasArmor = false;
  justGotArmor = false;

  hasPotato = false;
  justGotPotato = false;

  activeNPC = null;

  constructor() {
    super("GameScene");
  }

  create() {
    this.map = this.make.tilemap({ key: "map_dungeon" });
    const tileset = this.map.addTilesetImage("tileset", "tiles_dungeon");

    this.layers.ground = this.map.createLayer("Dungeon", tileset, 0, 0);
    this.layers.ground.setDepth(0);
    this.layers.objects = this.map.createLayer("Objects", tileset, 0, 0);
    this.layers.objects.setDepth(1);
    this.layers.carts = this.map.createLayer("Carts", tileset, 0, 0);
    this.layers.carts.setDepth(3);

    this.player = new Player(this, 110, 150, "player_sheet", 112);

    this.writer = this.physics.add.sprite(60, 290, "player_sheet", 99);
    this.writer.setDepth(2);
    this.writer.setImmovable(true);

    this.armorer = this.physics.add.sprite(280, 280, "player_sheet", 87);
    this.armorer.setDepth(2);
    this.armorer.setImmovable(true);
    this.armorer.setFlipX(true);

    this.merchant = this.physics.add.sprite(200, 200, "player_sheet", 86);
    this.merchant.setDepth(2);
    this.merchant.setImmovable(true);

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setZoom(2);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.layers.ground.setCollisionByProperty({ collides: true });
    this.layers.objects.setCollisionByProperty({ collides: true });
    this.layers.carts.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.player, this.layers.ground);
    this.physics.add.collider(this.player, this.layers.objects);
    this.physics.add.collider(this.player, this.layers.carts);

    this.physics.add.collider(this.player, this.writer);
    this.physics.add.collider(this.player, this.armorer);
    this.physics.add.collider(this.player, this.merchant);

    this.scene.launch("UIScene");
  }

  update(time, delta) {
    this.player.update();

    const distWriter = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.writer.x, this.writer.y
    );
    const distArmorer = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.writer.x, this.writer.y
    );
    const distMerchant = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.writer.x, this.writer.y
    );

    if (distWriter < 30) {
      if (!this.hasDiary) {
        this.hasDiary = true;
        this.justGotDiary = true;
        console.log("Diary received.");
        this.events.emit("get-diary");
      }
      let text = this.justGotDiary
        ? 'Writer: "Hello! Take this diary..."'
        : 'Writer: "Good luck! Don\'t forget to write."';
      this.events.emit("show-dialog", text);
      this.activeNPC = "writer";
    } else if (distArmorer < 30) {
      if (!this.hasArmor) {
        this.hasArmor = true;
        this.justGotArmor = true;
        console.log("Armor received.");
        this.events.emit("get-armor");
      }
      let text = this.justGotArmor
        ? 'Armorer: "Dangerous out there. Take this armor!"'
        : 'Armorer: "Stay safe, traveler."';
      this.events.emit("show-dialog", text);
      this.activeNPC = "armorer";
    } else if (distMerchant < 30) {
      if (!this.hasPotato) {
        this.hasPotato = true;
        this.justGotPotato = true;
        console.log("Potato received.");
        this.events.emit("get-potato");
      }
      let text = this.justGotPotato
        ? 'Merchant: "Fresh potatoes! Best price!"'
        : 'Merchant: "Come back if you get hungry."';
      this.events.emit("show-dialog", text);
      this.activeNPC = "merchant";
    } else {
      this.events.emit("hide-dialog");
      if (this.justGotDiary) this.justGotDiary = false;
      if (this.justGotArmor) this.justGotArmor = false;
      if (this.justGotPotato) this.justGotPotato = false;
      this.activeNPC = null;
    }
  }
}
