// src/scenes/UIScene.js
import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  dialogText;
  diaryIcon;
  armorIcon;
  potatoIcon;
  darknessOverlay;

  constructor() {
    super("UIScene");
  }

  create() {
    // Dialog text
    this.dialogText = this.add
      .text(400, 550, "", {
        fontSize: "20px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 20, y: 20 },
        wordWrap: { width: 700 },
        align: "center",
      })
      .setOrigin(0.5);
    this.dialogText.setVisible(false);
    this.dialogText.setDepth(100);

    // Icons
    this.diaryIcon = this.createIcon(650, "📔 Diary", "#FFFF00");
    this.armorIcon = this.createIcon(510, "🛡️ Armor", "#00FFFF");
    this.potatoIcon = this.createIcon(370, "🥔 Potato", "#FFA500");

    // Darkness overlay
    this.darknessOverlay = this.add.rectangle(0, 0, 800, 600, 0x000022); // Dark blue tint
    this.darknessOverlay.setOrigin(0, 0);
    this.darknessOverlay.setAlpha(0);
    this.darknessOverlay.setDepth(-1);

    // Events
    const gameScene = this.scene.get("GameScene");

    gameScene.events.on("show-dialog", (text) => {
      this.dialogText.setText(text);
      this.dialogText.setVisible(true);
    });

    gameScene.events.on("hide-dialog", () => {
      this.dialogText.setVisible(false);
    });

    gameScene.events.on("get-diary", () => this.pulseIcon(this.diaryIcon));
    gameScene.events.on("get-armor", () => this.pulseIcon(this.armorIcon));
    gameScene.events.on("get-potato", () => this.pulseIcon(this.potatoIcon));

    gameScene.events.on("set-time", (time) => {
        let targetAlpha = 0;
        if (time === 'dusk') targetAlpha = 0.3;   // Evening
        if (time === 'night') targetAlpha = 0.7;

        // Smooth transition
        this.tweens.add({
            targets: this.darknessOverlay,
            alpha: targetAlpha,
            duration: 2000 
        });
    });
  }

  createIcon(x, text, color) {
      const icon = this.add.text(x, 20, text, {
        fontSize: "20px",
        fill: color,
        backgroundColor: "#000000aa",
        padding: { x: 10, y: 5 },
      });
      icon.setVisible(false);
      icon.setAlpha(1);
      icon.setDepth(10); 
      return icon;
  }

  pulseIcon(target) {
    target.setVisible(true);
    this.tweens.add({
      targets: target,
      alpha: 0.2,
      duration: 300,
      ease: "Linear",
      yoyo: true,
      repeat: 3,
    });
  }
}
