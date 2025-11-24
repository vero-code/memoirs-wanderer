// src/scenes/GameScene.js
import Phaser from 'phaser';
import Player from '../entities/Player.js';
import { ExitZoneHelper } from '../utils/ExitZoneHelper.js';
import { TimeOfDayHelper } from '../utils/TimeOfDayHelper.js';
import { NPCHelper } from '../utils/NPCHelper.js';
import { SaveManager } from '../utils/SaveManager.js';

export default class GameScene extends Phaser.Scene {
  map;
  player;
  writer;
  armorer;
  merchant;
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
  isDay2WakeUp = false;

  startPosition = { x: 110, y: 150 };

  constructor() {
    super('GameScene');
  }

  init(data) {
    this.isDay2WakeUp = data.isDay2WakeUp || false;

    if (data.fromForest) {
      this.startPosition = { x: 480, y: 165 };
    } else if (data.isDay2WakeUp) {
      this.startPosition = { x: 150, y: 150 };
    } else {
      const hasEntered = this.registry.get('hasEnteredTown');

      if (hasEntered) {
        this.startPosition = { x: 185, y: 182 };
      } else {
        this.startPosition = { x: 24, y: 35 };
      }
    }
  }

  getText(key) {
    const localeData = this.registry.get('locale_data');
    return localeData ? localeData[key] : key;
  }

  create() {
    this.loadGameState();
    this.createWorld();
    this.createPlayer();
    this.createNPCs();
    this.setupCamera();
    this.setupCollisions();
    this.setupExitZone();
    this.setupUI();

    this.registry.set('hasEnteredTown', true);
    SaveManager.save(this);

    this.events.on('language-changed', () => {
      if (this.activeNPC === 'writer') this.handleWriterInteraction();
      else if (this.activeNPC === 'armorer') this.handleArmorerInteraction();
      else if (this.activeNPC === 'merchant') this.handleMerchantInteraction();
    });

    if (this.isDay2WakeUp) {
      this.time.delayedCall(1500, () => {
        this.showThought('heroThoughts_mustFindBag');
      });
    }
  }

  loadGameState() {
    this.hasDiary = this.registry.get('hasDiary') || false;
    this.hasArmor = this.registry.get('hasArmor') || false;
    this.hasPotato = this.registry.get('hasPotato') || false;
    this.isEvening = this.registry.get('isEvening') || false;
  }

  createWorld() {
    this.map = this.make.tilemap({ key: 'map_dungeon' });
    const tileset = this.map.addTilesetImage('tileset', 'tiles_dungeon');

    this.layers.ground = this.map.createLayer('Dungeon', tileset, 0, 0);
    this.layers.ground.setDepth(0);

    this.layers.objects = this.map.createLayer('Objects', tileset, 0, 0);
    this.layers.objects.setDepth(1);

    this.layers.carts = this.map.createLayer('Carts', tileset, 0, 0);
    this.layers.carts.setDepth(3);
  }

  createPlayer() {
    this.player = new Player(
      this,
      this.startPosition.x,
      this.startPosition.y,
      'player_sheet',
      112,
    );
  }

  createNPCs() {
    this.writer = NPCHelper.createNPC(this, 60, 290, 'player_sheet', 99);
    this.armorer = NPCHelper.createNPC(
      this,
      280,
      280,
      'player_sheet',
      87,
      true,
    );
    this.merchant = NPCHelper.createNPC(this, 450, 300, 'player_sheet', 86);

    this.addInteractionHint(this.writer);
    this.addInteractionHint(this.armorer);
    this.addInteractionHint(this.merchant);
  }

  addInteractionHint(npcSprite) {
    const hint = this.add
      .text(npcSprite.x, npcSprite.y - 25, '...', {
        fontFamily: 'serif',
        fontSize: '20px',
        fontStyle: 'bold',
        fill: '#fff', //ffcc00, ffff00
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: hint,
      y: npcSprite.y - 30,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  setupCamera() {
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
  }

  setupCollisions() {
    // Map collisions
    this.layers.ground.setCollisionByProperty({ collides: true });
    this.layers.objects.setCollisionByProperty({ collides: true });
    this.layers.carts.setCollisionByProperty({ collides: true });

    // Player vs map
    this.physics.add.collider(this.player, this.layers.ground);
    this.physics.add.collider(this.player, this.layers.objects);
    this.physics.add.collider(this.player, this.layers.carts);

    // NPC vs map
    this.physics.add.collider(this.writer, this.layers.objects);

    // Player vs NPCs
    this.physics.add.collider(this.player, this.writer);
    this.physics.add.collider(this.player, this.armorer);
    this.physics.add.collider(this.player, this.merchant);
  }

  setupExitZone() {
    this.exitZone = ExitZoneHelper.createRightExit(this, this.map);

    // Exit zone overlap
    this.physics.add.overlap(this.player, this.exitZone, () => {
      const itemsLost = this.registry.get('itemsLost');

      if (itemsLost) {
        this.showThought('heroThoughts_mustFindBag');
        this.scene.stop('UIScene');
        this.scene.start('ForestScene');
        return;
      }

      let missingItemTextKey = null;

      if (!this.hasDiary) {
        missingItemTextKey = 'heroThoughts_cantLeave';
      } else if (!this.hasPotato) {
        const hasVisited = this.registry.get('hasVisitedForest');

        if (!hasVisited) {
          missingItemTextKey = 'heroThoughts_needPotato';
        }
      }

      if (missingItemTextKey) {
        this.showThought(missingItemTextKey);
        this.player.setPosition(this.player.x - 30, this.player.y);
        this.player.setVelocity(0);
        return;
      }

      this.registry.set('hasVisitedForest', true);
      SaveManager.save(this);

      this.scene.stop('UIScene');
      this.scene.start('ForestScene');
    });

    // DEBUG: Uncomment to visualize exit zone
    // const debugRect = this.add.rectangle(
    //   mapRight,
    //   mapMiddle,
    //   exitZoneWidth,
    //   exitZoneHeight,
    //   0x00ff00,
    //   0.5,
    // );
    // debugRect.setDepth(10);
  }

  setupUI() {
    this.scene.launch('UIScene', {
      isEvening: this.isEvening,
      animated: false,
      locationKey: 'location_town',
    });
  }

  setEveningFirstTime() {
    this.isEvening = TimeOfDayHelper.setEveningFirstTime(this);
  }

  update(time, delta) {
    this.player.update();
    // console.log(
    //   `Player position: x=${this.player.x.toFixed(0)}, y=${this.player.y.toFixed(0)}`,
    // );
    this.checkNPCInteractions();
  }

  checkNPCInteractions() {
    if (NPCHelper.isNearby(this.player, this.writer)) {
      this.handleWriterInteraction();
    } else if (NPCHelper.isNearby(this.player, this.armorer)) {
      this.handleArmorerInteraction();
    } else if (NPCHelper.isNearby(this.player, this.merchant)) {
      this.handleMerchantInteraction();
    } else {
      this.handleNoInteraction();
    }
  }

  handleWriterInteraction() {
    if (this.justGotDiary) {
      this.events.emit('show-dialog', this.getText('writerHello'));
      this.activeNPC = 'writer';
      return;
    }

    const alreadyReceived = this.registry.get('receivedDiary');

    if (!alreadyReceived) {
      this.hasDiary = true;
      this.justGotDiary = true;

      this.registry.set('hasDiary', true);
      this.registry.set('receivedDiary', true);

      this.events.emit('get-diary');
      this.events.emit('show-dialog', this.getText('writerHello'));

      SaveManager.save(this);
    } else {
      this.events.emit('show-dialog', this.getText('writerGoodbye'));
    }

    this.activeNPC = 'writer';
  }

  handleArmorerInteraction() {
    if (this.justGotArmor) {
      this.events.emit('show-dialog', this.getText('armorerSuccess'));
      this.activeNPC = 'armorer';
      return;
    }

    if (this.hasArmor) {
      this.events.emit('show-dialog', this.getText('armorerGoodbye'));
      this.activeNPC = 'armorer';
      return;
    }

    const currentStones = Number(this.registry.get('hasStone')) || 0;
    const REQUIRED_STONES = 14;

    if (currentStones >= REQUIRED_STONES) {
      const stonesLeft = currentStones - REQUIRED_STONES;

      this.hasArmor = true;
      this.registry.set('hasArmor', true);
      this.registry.set('hasStone', stonesLeft > 0 ? stonesLeft : false);

      this.justGotArmor = true;

      this.events.emit('get-armor');
      this.events.emit('get-stone');

      this.events.emit('show-dialog', this.getText('armorerSuccess'));

      SaveManager.save(this);
    } else {
      this.registry.set('metArmorer', true);
      this.events.emit('show-dialog', this.getText('armorerQuest'));
      SaveManager.save(this);
    }

    this.activeNPC = 'armorer';
  }

  handleMerchantInteraction() {
    if (this.justGotPotato) {
      this.events.emit('show-dialog', this.getText('merchantHello'));
      this.activeNPC = 'merchant';
      return;
    }

    const alreadyReceived = this.registry.get('receivedFreePotato');

    if (!alreadyReceived) {
      this.hasPotato = true;
      this.justGotPotato = true;
      this.registry.set('hasPotato', true);
      this.registry.set('receivedFreePotato', true);
      this.events.emit('get-potato');

      if (!this.isEvening) {
        this.setEveningFirstTime();
      }
      this.events.emit('show-dialog', this.getText('merchantHello'));

      SaveManager.save(this);
    } else {
      const PRICE = 50;
      const currentCoins = this.registry.get('playerCoins') || 0;

      if (currentCoins >= PRICE) {
        this.registry.set('playerCoins', currentCoins - PRICE);

        let potatoCount = this.registry.get('hasPotato') || 0;

        if (typeof potatoCount !== 'number') potatoCount = 0;

        this.registry.set('hasPotato', potatoCount + 1);
        this.hasPotato = true;

        this.events.emit('get-potato');
        const uiScene = this.scene.get('UIScene');
        if (uiScene) uiScene.updateUITexts();

        this.events.emit('show-dialog', this.getText('merchantBought'));
      } else {
        this.events.emit('show-dialog', `${this.getText('merchantSell')}`);

        if (currentCoins < PRICE) {
          this.time.delayedCall(2000, () => {
            this.events.emit('show-dialog', this.getText('merchantNoMoney'));
          });
        }
      }
    }

    this.activeNPC = 'merchant';
  }

  handleNoInteraction() {
    this.events.emit('hide-dialog');

    if (this.justGotDiary) this.justGotDiary = false;
    if (this.justGotArmor) this.justGotArmor = false;
    if (this.justGotPotato) this.justGotPotato = false;

    this.activeNPC = null;
  }

  showThought(textKey) {
    const text = this.getText(textKey);

    if (this.currentThought) this.currentThought.destroy();

    this.currentThought = this.add
      .text(this.player.x, this.player.y - 40, text, {
        fontSize: '10px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 6, y: 4 },
        align: 'center',
        wordWrap: { width: 70 },
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.tweens.add({
      targets: this.currentThought,
      y: this.currentThought.y - 30,
      alpha: 0,
      duration: 2500,
      ease: 'Power1',
      onComplete: () => {
        if (this.currentThought) {
          this.currentThought.destroy();
          this.currentThought = null;
        }
      },
    });
  }
}
