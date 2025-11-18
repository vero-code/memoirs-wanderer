// src/scenes/UIScene.js
import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  dialogText;

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

    const gameScene = this.scene.get("GameScene");
    gameScene.events.on("show-dialog", (text) => {
      this.dialogText.setText(text);
      this.dialogText.setVisible(true);
    });

    gameScene.events.on("hide-dialog", () => {
      this.dialogText.setVisible(false);
    });
  }
}
