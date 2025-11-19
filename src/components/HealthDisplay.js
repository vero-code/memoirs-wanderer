// src/components/HealthDisplay.js
export class HealthDisplay {
  constructor(scene, maxHealth = 3) {
    this.scene = scene;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.hearts = [];
    
    this.createHearts();
  }

  createHearts() {
    this.hearts.forEach((h) => h.destroy());
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.scene.add.text(20 + i * 30, 20, '❤️', {
        fontSize: '24px',
      });
      heart.setDepth(10);
      this.hearts.push(heart);
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      const heartToRemove = this.hearts[this.currentHealth];
      this.flashRemainingHearts();
      if (heartToRemove) {
        this.animateHeartDeath(heartToRemove);
      }
      return this.currentHealth === 0;
    }
    return false;
  }

  flashRemainingHearts() {
    for (let i = 0; i < this.currentHealth; i++) {
      const heart = this.hearts[i];
      if (heart && heart.active) {
        this.scene.tweens.add({
          targets: heart,
          alpha: 0.5,
          scale: 1.2,
          duration: 100,
          yoyo: true,
          repeat: 1,
        });
      }
    }
  }

  animateHeartDeath(heart) {
    this.scene.tweens.add({
      targets: heart,
      alpha: 0,
      scale: 2,
      angle: 360,
      duration: 400,
      ease: 'Power1',
      onComplete: () => {
        heart.destroy();
      },
    });
  }

  reset() {
    this.createHearts();
    this.currentHealth = this.maxHealth;
  }

  getCurrentHealth() {
    return this.currentHealth;
  }
}
