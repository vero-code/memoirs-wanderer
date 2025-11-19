// src/utils/NPCHelper.js
export class NPCHelper {
  /**
   * Creates an NPC sprite
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @param {number} frame
   * @param {boolean} flipX - Flip horizontally
   */
  static createNPC(scene, x, y, texture, frame, flipX = false) {
    const npc = scene.physics.add.sprite(x, y, texture, frame);
    npc.setDepth(2);
    npc.setImmovable(true);
    if (flipX) npc.setFlipX(true);
    return npc;
  }

  /**
   * Checks the distance between the player and the NPC
   */
  static getDistance(player, npc) {
    return Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y);
  }

  /**
   * Checks whether the player is near the NPC
   */
  static isNearby(player, npc, distance = 30) {
    return NPCHelper.getDistance(player, npc) < distance;
  }
}