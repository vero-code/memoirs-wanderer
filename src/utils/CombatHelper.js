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

  static showAttackEffect(scene, x, y, direction) {
      let swordX = x;
      let swordY = y;
      let angle = 0;

      switch (direction) {
        case 'left':
          swordX -= 16;
          angle = -90;
          break;
        case 'right':
          swordX += 16;
          angle = 90;
          break;
        case 'up':
          swordY -= 16;
          angle = 0;
          break;
        case 'down':
          swordY += 16;
          angle = 180;
          break;
      }

      const sword = scene.add.sprite(swordX, swordY, 'player_sheet', 103);
      sword.setDepth(10);
      sword.setAngle(angle);

      scene.tweens.add({
          targets: sword,
          alpha: 0,
          scale: 1.5,
          duration: 150,
          onComplete: () => {
              sword.destroy();
          }
      });
  }

  /**
   * Sets up the combat system for the scene
   */
  static setupCombatSystem(scene, enemies, onKill) {
    const onAttack = (x, y, direction) => {
      const hitbox = CombatHelper.createAttackHitbox(scene, x, y, direction);
      
      CombatHelper.showAttackEffect(scene, x, y, direction);

      scene.physics.overlap(hitbox, enemies, (sword, enemy) => {
        enemy.disableBody(true, true);
        if (onKill) onKill();
      });

      scene.time.delayedCall(50, () => {
          if (hitbox.active) hitbox.destroy();
      });
    };

    scene.events.on('player-attack', onAttack);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        scene.events.off('player-attack', onAttack);
    });
  }
}
