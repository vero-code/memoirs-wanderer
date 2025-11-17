// src/scenes/GameScene.js
import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    const S = this.registry.get("locale_data");

    this.add
      .text(400, 300, S.gameStart, {
        fontSize: "32px",
        color: "#00ff00",
      })
      .setOrigin(0.5);

    // Language switcher button
    const switchButton = this.add
      .text(400, 350, S.switchLang, {
        fontSize: "24px",
        color: "#FFFF00",
        backgroundColor: "#333333",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    switchButton.on("pointerdown", () => {
      const currentLang = this.registry.get("current_lang");
      const newLang = currentLang === "en" ? "ru" : "en";
      const newData = this.cache.json.get(`locale_${newLang}`);

      this.registry.set("locale_data", newData);
      this.registry.set("current_lang", newLang);

      this.scene.restart();
    });
  }

  update(time, delta) {
    // game loop, executed every frame
    // contain the character movement logic, enemy AI, etc.
  }
}
