// src/scenes/GameScene.js
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export default class GameScene extends Phaser.Scene {
  map;
  player;
  writer;
  armorer;
  merchant;
  enemies;
  layers = {};
  exitZone;

  // Quests
  hasDiary = false;
  hasArmor = false;
  hasPotato = false;
  justGotDiary = false;
  justGotArmor = false;
  justGotPotato = false;

  activeNPC = null;
  isEvening = false;

  constructor() {
    super('GameScene');
  }

  create() {
    this.map = this.make.tilemap({ key: 'map_dungeon' });
    const tileset = this.map.addTilesetImage('tileset', 'tiles_dungeon');

    this.layers.ground = this.map.createLayer('Dungeon', tileset, 0, 0);
    this.layers.ground.setDepth(0);
    this.layers.objects = this.map.createLayer('Objects', tileset, 0, 0);
    this.layers.objects.setDepth(1);
    this.layers.carts = this.map.createLayer('Carts', tileset, 0, 0);
    this.layers.carts.setDepth(3);

    this.player = new Player(this, 110, 150, 'player_sheet', 112);

    // NPC
    this.writer = this.physics.add.sprite(60, 290, 'player_sheet', 99);
    this.writer.setDepth(2);
    this.writer.setImmovable(true);

    this.armorer = this.physics.add.sprite(280, 280, 'player_sheet', 87);
    this.armorer.setDepth(2);
    this.armorer.setImmovable(true);
    this.armorer.setFlipX(true);

    this.merchant = this.physics.add.sprite(450, 300, 'player_sheet', 86);
    this.merchant.setDepth(2);
    this.merchant.setImmovable(true);

    this.enemies = this.add.group();

    const zombie1 = new Enemy(this, 200, 100, 'player_sheet', 122, this.player);
    this.enemies.add(zombie1);
    const zombie2 = new Enemy(this, 100, 250, 'player_sheet', 122, this.player);
    this.enemies.add(zombie2);

    // Exit zone
    const exitZoneWidth = 20;
    const exitZoneHeight = 30;

    const mapRight = this.map.widthInPixels - 10;
    const mapMiddle = this.map.heightInPixels / 2;

    this.exitZone = this.add.zone(mapRight, mapMiddle, exitZoneWidth, exitZoneHeight);
    this.physics.world.enable(this.exitZone);
    this.exitZone.body.setAllowGravity(false);
    this.exitZone.body.moves = false;

    // const debugRect = this.add.rectangle(
    //   mapRight,
    //   mapMiddle,
    //   exitZoneWidth,
    //   exitZoneHeight,
    //   0x00ff00,
    //   0.5,
    // );
    // debugRect.setDepth(10);

    // Camera and World
    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setZoom(2);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );

    // Map Collisions
    this.layers.ground.setCollisionByProperty({ collides: true });
    this.layers.objects.setCollisionByProperty({ collides: true });
    this.layers.carts.setCollisionByProperty({ collides: true });

    this.physics.add.collider(this.player, this.layers.ground);
    this.physics.add.collider(this.player, this.layers.objects);
    this.physics.add.collider(this.player, this.layers.carts);

    this.physics.add.collider(this.writer, this.layers.objects);

    // Enemies Collisions
    this.physics.add.collider(this.enemies, this.layers.ground);
    this.physics.add.collider(this.enemies, this.layers.objects);
    this.physics.add.collider(this.enemies, this.layers.carts);

    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        player.clearTint();
      });
    });

    // NPC collisions
    this.physics.add.collider(this.player, this.writer);
    this.physics.add.collider(this.player, this.armorer);
    this.physics.add.collider(this.player, this.merchant);

    this.events.on('player-attack', (x, y, direction) => {
      let hitX = x;
      let hitY = y;
      const range = 20;

      if (direction === 'left') hitX -= range;
      else if (direction === 'right') hitX += range;
      else if (direction === 'up') hitY -= range;
      else if (direction === 'down') hitY += range;

      const swordHitbox = this.physics.add.sprite(hitX, hitY, null);
      swordHitbox.setSize(24, 24);
      swordHitbox.setVisible(false);

      this.physics.overlap(swordHitbox, this.enemies, (sword, enemy) => {
        enemy.disableBody(true, true);
      });

      swordHitbox.destroy();
    });

    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      player.setTint(0xff0000);
      this.time.delayedCall(200, () => {
        player.clearTint();
      });
    });

    this.physics.add.overlap(this.player, this.exitZone, () => {
      console.log('Leaving the city...');
    });

    this.scene.launch('UIScene');
  }

  update(time, delta) {
    this.player.update();

    // console.log(
    //   `Player position: x=${this.player.x.toFixed(0)}, y=${this.player.y.toFixed(0)}`,
    // );

    this.enemies.children.iterate((child) => {
      if (child) child.update();
    });

    const distWriter = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.writer.x,
      this.writer.y,
    );
    const distArmorer = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.armorer.x,
      this.armorer.y,
    );
    const distMerchant = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.merchant.x,
      this.merchant.y,
    );

    if (distWriter < 30) {
      if (!this.hasDiary) {
        this.hasDiary = true;
        this.justGotDiary = true;
        console.log('Diary received.');
        this.events.emit('get-diary');
      }
      let text = this.justGotDiary
        ? 'Writer: "Hello! Take this diary..."'
        : 'Writer: "Good luck! Don\'t forget to write."';
      this.events.emit('show-dialog', text);
      this.activeNPC = 'writer';
    } else if (distArmorer < 30) {
      if (!this.hasArmor) {
        this.hasArmor = true;
        this.justGotArmor = true;
        console.log('Armor received.');
        this.events.emit('get-armor');
      }
      let text = this.justGotArmor
        ? 'Armorer: "Dangerous out there. Take this armor!"'
        : 'Armorer: "Stay safe, traveler."';
      this.events.emit('show-dialog', text);
      this.activeNPC = 'armorer';
    } else if (distMerchant < 30) {
      if (!this.hasPotato) {
        this.hasPotato = true;
        this.justGotPotato = true;
        console.log('Potato received.');
        this.events.emit('get-potato');

        if (!this.isEvening) {
          this.isEvening = true;
          this.events.emit('set-time', 'dusk');
        }
      }
      let text = this.justGotPotato
        ? 'Merchant: "Fresh potatoes! Best price!"'
        : 'Merchant: "Come back if you get hungry."';
      this.events.emit('show-dialog', text);
      this.activeNPC = 'merchant';
    } else {
      this.events.emit('hide-dialog');
      if (this.justGotDiary) this.justGotDiary = false;
      if (this.justGotArmor) this.justGotArmor = false;
      if (this.justGotPotato) this.justGotPotato = false;
      this.activeNPC = null;
    }
  }
}
