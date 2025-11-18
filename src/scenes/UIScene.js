// src/scenes/UIScene.js
import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  dialogText;
  diaryIcon;
  armorIcon;

  constructor() {
    super("UIScene");
  }

  create() {
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

    this.diaryIcon = this.add.text(650, 20, "📔 Diary", {
      fontSize: "20px",
      fill: "#FFFF00",
      backgroundColor: "#000000aa",
      padding: { x: 8, y: 4 },
    });
    this.diaryIcon.setVisible(false);
    this.diaryIcon.setAlpha(1);
    this.diaryIcon.setScrollFactor(0);

    this.armorIcon = this.add.text(510, 20, "🛡️ Armor", {
      fontSize: "20px",
      fill: "#00FFFF",
      backgroundColor: "#000000aa",
      padding: { x: 10, y: 5 },
    });
    this.armorIcon.setVisible(false);
    this.armorIcon.setAlpha(1);

    const gameScene = this.scene.get("GameScene");
    gameScene.events.on("show-dialog", (text) => {
      this.dialogText.setText(text);
      this.dialogText.setVisible(true);
    });

    gameScene.events.on("hide-dialog", () => {
      this.dialogText.setVisible(false);
    });

    gameScene.events.on("get-diary", () => {
      this.diaryIcon.setVisible(true);
      this.diaryIcon.setAlpha(1);

      this.tweens.add({
        targets: this.diaryIcon,
        alpha: 0.2,
        duration: 300,
        ease: "Linear",
        yoyo: true,
        repeat: 3,
      });
    });

    gameScene.events.on("get-armor", () => {
      this.armorIcon.setVisible(true);
      this.tweens.add({
        targets: this.armorIcon,
        alpha: 0.2,
        duration: 300,
        ease: "Linear",
        yoyo: true,
        repeat: 3,
      });
    });
  }
}
