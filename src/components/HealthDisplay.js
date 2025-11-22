// src/components/HealthDisplay.js
export class HealthDisplay {
  constructor(scene, maxHealth = 3) {
    this.scene = scene;
    this.maxHealth = maxHealth;
    this.hearts = [];
    const storedHealth = this.scene.registry.get('playerHealth');
    this.currentHealth = storedHealth !== undefined ? storedHealth : maxHealth;
    this.createHearts();
  }

  createHearts() {
    this.hearts.forEach((h) => h.destroy());
    this.hearts = [];
    for (let i = 0; i < this.currentHealth; i++) {
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
      this.scene.registry.set('playerHealth', this.currentHealth);
      this.flashRemainingHearts();
      const heartToRemove = this.hearts.pop();
      if (heartToRemove) {
        this.animateHeartDeath(heartToRemove);
      }
      return this.currentHealth === 0;
    }
    return false;
  }

  flashRemainingHearts() {
    this.hearts.forEach((heart) => {
      if (heart && heart.active) {
        this.scene.tweens.add({
          targets: heart,
          scale: 1.2,
          duration: 100,
          yoyo: true,
          repeat: 1,
        });
      }
    });
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

  heal(amount = 1) {
    if (this.currentHealth < this.maxHealth) {
      this.currentHealth += amount;

      if (this.currentHealth > this.maxHealth) {
        this.currentHealth = this.maxHealth;
      }

      this.scene.registry.set('playerHealth', this.currentHealth);
      this.createHearts();

      const lastHeart = this.hearts[this.hearts.length - 1];
      if (lastHeart) {
        lastHeart.setScale(0);
        this.scene.tweens.add({
          targets: lastHeart,
          scale: 1,
          duration: 400,
          ease: 'Back.out',
        });
      }

      return true;
    }
    return false;
  }

  reset() {
    this.currentHealth = this.maxHealth;
    this.scene.registry.set('playerHealth', this.currentHealth);
    this.createHearts();
  }

  getCurrentHealth() {
    return this.currentHealth;
  }
}
