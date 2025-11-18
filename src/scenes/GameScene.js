// src/scenes/GameScene.js
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  map;
  player;
  writer;
  layers = {};
  cursors;

  hasDiary = false;
  dialogText;

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

    this.player = this.physics.add.sprite(110, 150, "player_sheet", 112);
    this.player.setDepth(2);

    this.writer = this.physics.add.sprite(60, 290, "player_sheet", 99);
    this.writer.setDepth(2);
    this.writer.setImmovable(true);

    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
    });

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
    this.player.setCollideWorldBounds(true);

    this.layers.ground.setCollisionByProperty({ collides: true });
    this.layers.objects.setCollisionByProperty({ collides: true });
    this.layers.carts.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.player, this.layers.ground);
    this.physics.add.collider(this.player, this.layers.objects);
    this.physics.add.collider(this.player, this.layers.carts);

    this.physics.add.collider(this.player, this.writer);

    this.dialogText = this.add.text(10, 220, "", {
      fontSize: "10px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 5, y: 5 },
      wordWrap: { width: 300 },
    });
    this.dialogText.setScrollFactor(0);
    this.dialogText.setDepth(100);
    this.dialogText.setVisible(false);
  }

  update(time, delta) {
    this.player.setVelocity(0);
    const speed = 100;
    if (this.cursors.left.isDown || this.cursors.A.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (this.cursors.right.isDown || this.cursors.D.isDown) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    }

    if (this.cursors.up.isDown || this.cursors.W.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.cursors.S.isDown) {
      this.player.setVelocityY(speed);
    }
    this.player.body.velocity.normalize().scale(speed);

    const dist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.writer.x,
      this.writer.y
    );

    if (dist < 30) {
      this.dialogText.setVisible(true);
      if (this.hasDiary) {
         this.dialogText.setText('Writer: "Good luck! Don\'t forget to write."');
      } else {
         this.dialogText.setText('Writer: "Hello! Take this diary..."');
      }
    } else {
      this.dialogText.setVisible(false);
      if (dist > 30 && dist < 40 && !this.hasDiary) {
          this.hasDiary = true;
          console.log("Diary received.");
      }
    }
  }
}
