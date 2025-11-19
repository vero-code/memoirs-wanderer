// src/utils/TimeOfDayHelper.js
export class TimeOfDayHelper {
  /**
   * Applies the time of day to the scene
   * @param {Phaser.Scene} scene - The game scene
   * @param {boolean} isEvening - Whether it is currently evening
   * @param {boolean} animated - Whether to animate the transition
   */
  static applyTimeOfDay(scene, isEvening, animated = false) {
    if (isEvening) {
      scene.time.delayedCall(100, () => {
        scene.events.emit('set-time', 'dusk', animated);
      });
    }
  }

  /**
   * Sets evening for the first time (with animation)
   */
  static setEveningFirstTime(scene) {
    scene.registry.set('isEvening', true);
    scene.events.emit('set-time', 'dusk', true);
    return true;
  }
}