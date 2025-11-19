import Phaser from 'phaser';
import Enemy from './Enemy.js';

export default class AmbushBush extends Phaser.Physics.Arcade.Sprite {
  isTriggered = false;
  player;
  enemiesGroup;

  constructor(scene, x, y, texture, frame, player, enemiesGroup) {
    super(scene, x, y, texture, frame);

    this.scene = scene;
    this.player = player;
    this.enemiesGroup = enemiesGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.setDepth(1);
    this.body.setSize(14, 14);
    this.body.setOffset(1, 1);
  }

  update() {
    if (this.isTriggered) return;

    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y,
    );

    if (dist < 50) {
      this.triggerAmbush();
    }
  }

  triggerAmbush() {
    this.isTriggered = true;

    this.scene.tweens.add({
      targets: this,
      x: this.x + 2,
      duration: 50,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.spawnEnemy();
      },
    });
  }

  spawnEnemy() {
    const scene = this.scene;
    const spawnX = this.x;
    const spawnY = this.y;
    const player = this.player;
    const enemiesGroup = this.enemiesGroup;

    if (!scene || !scene.scene.isActive()) {
      console.warn('Scene not active, cannot spawn enemy');
      this.destroy();
      return;
    }

    this.destroy();

    const enemy = new Enemy(scene, spawnX, spawnY, 'player_sheet', 122, player);
    enemiesGroup.add(enemy);

    enemy.setScale(0);
    scene.tweens.add({
      targets: enemy,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.out',
    });
  }
}
