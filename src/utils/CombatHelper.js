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
    scene.events.off('player-attack');
    const attackHandler = (x, y, direction) => {
      if (!scene.scene.isActive()) {
        console.warn('Scene not active, ignoring attack');
        return;
      }

      if (!enemies || !enemies.children || enemies.children.size === 0) {
        console.warn('No enemies to attack');
        return;
      }
      const hitbox = CombatHelper.createAttackHitbox(scene, x, y, direction);
      const overlapCollider = scene.physics.add.overlap(
        hitbox,
        enemies,
        (sword, enemy) => {
          if (enemy && enemy.active) {
            enemy.disableBody(true, true);
            if (onKill) {
              onKill();
            }
          }
        },
      );
      scene.time.delayedCall(50, () => {
        if (overlapCollider) {
          scene.physics.world.removeCollider(overlapCollider);
        }
        if (hitbox && hitbox.active) {
          hitbox.destroy();
        }
      });
    };

    scene.events.on('player-attack', attackHandler);
    scene.events.once('shutdown', () => {
      scene.events.off('player-attack', attackHandler);
    });

    scene.events.once('destroy', () => {
      scene.events.off('player-attack', attackHandler);
    });
  }
}
