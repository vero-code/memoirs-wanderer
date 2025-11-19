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
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.scene.add.text(20 + i * 30, 20, '❤️', { 
        fontSize: '24px' 
      });
      heart.setDepth(10);
      this.hearts.push(heart);
    }
  }

  takeDamage() {
    if (this.currentHealth > 0) {
      this.currentHealth--;
      
      const heartToRemove = this.hearts[this.currentHealth];
      if (heartToRemove) {
        this.animateHeartRemoval(heartToRemove);
      }
      
      return this.currentHealth === 0; // Returns true if dead
    }
    return false;
  }

  animateHeartRemoval(heart) {
    this.scene.tweens.add({
      targets: heart,
      alpha: 0,
      scale: 0,
      duration: 200,
      onComplete: () => {
        heart.destroy();
      },
    });
  }

  reset() {
    this.hearts.forEach(heart => heart.destroy());
    this.hearts = [];
    this.currentHealth = this.maxHealth;
    this.createHearts();
  }

  getCurrentHealth() {
    return this.currentHealth;
  }
}