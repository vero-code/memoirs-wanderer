// src/utils/CombatHelper.js
export class CombatHelper {
  /**
   * Creates an attack hitbox
   * @param {Phaser.Scene} scene
   * @param {number} x - Player X position
   * @param {number} y - Player Y position
   * @param {string} direction - Attack direction
   * @param {number} range - Attack range
   */
  static createAttackHitbox(scene, x, y, direction, range = 20) {
    let hitX = x;
    let hitY = y;

    switch (direction) {
      case 'left':
        hitX -= range;
        break;
      case 'right':
        hitX += range;
        break;
      case 'up':
        hitY -= range;
        break;
      case 'down':
        hitY += range;
        break;
    }

    const hitbox = scene.physics.add.sprite(hitX, hitY, null);
    hitbox.setSize(24, 24);
    hitbox.setVisible(false);

    return hitbox;
  }

  /**
   * Sets up the combat system for the scene
   */
  static setupCombatSystem(scene, enemies, onKill) {
    scene.events.on('player-attack', (x, y, direction) => {
      const hitbox = CombatHelper.createAttackHitbox(scene, x, y, direction);

      scene.physics.overlap(hitbox, enemies, (sword, enemy) => {
        enemy.disableBody(true, true);
        if (onKill) onKill();
      });

      scene.time.delayedCall(50, () => hitbox.destroy());
    });
  }
}