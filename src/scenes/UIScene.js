// src/scenes/UIScene.js
import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  dialogText;
  diaryIcon;

  constructor() {
    super("UIScene");
  }

  create() {
    this.dialogText = this.add
      .text(400, 500, "", {
        fontSize: "24px",
        fill: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 20, y: 20 },
        wordWrap: { width: 700 },
        align: "center",
      })
      .setOrigin(0.5);
    this.dialogText.setVisible(false);

    this.diaryIcon = this.add.text(20, 20, "📔 Diary", {
      fontSize: "24px",
      fill: "#FFFF00",
      backgroundColor: "#000000aa",
      padding: { x: 10, y: 5 },
    });
    this.diaryIcon.setVisible(false);
    this.diaryIcon.setAlpha(1);

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
  }
}
