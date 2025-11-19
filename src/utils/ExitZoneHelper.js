// src/utils/ExitZoneHelper.js
export class ExitZoneHelper {
  /**
   * Creates an exit zone
   * @param {Phaser.Scene} scene - The scene
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Zone width
   * @param {number} height - Zone height
   * @param {boolean} debug - Whether to show the debug rectangle
   */
  static create(scene, x, y, width, height, debug = false) {
    const zone = scene.add.rectangle(x, y, width, height, 0xff0000, 0);
    scene.physics.world.enable(zone);
    zone.body.setAllowGravity(false);
    zone.body.moves = false;

    // Debug visualization
    if (debug) {
      const debugRect = scene.add.rectangle(x, y, width, height, 0x00ff00, 0.5);
      debugRect.setDepth(10);
    }

    return zone;
  }

  /**
   * Creates a right-side exit zone (for GameScene)
   */
  static createRightExit(scene, map, width = 20, height = 30, debug = false) {
    const x = map.widthInPixels - 10;
    const y = map.heightInPixels / 2;
    return ExitZoneHelper.create(scene, x, y, width, height, debug);
  }

  /**
   * Creates a left-side exit zone (for ForestScene)
   */
  static createLeftExit(scene, width = 20, height = 800, debug = false) {
    const x = 0;
    const y = 400;
    return ExitZoneHelper.create(scene, x, y, width, height, debug);
  }
}