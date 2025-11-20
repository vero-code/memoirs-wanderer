// src/components/LanguageButton.js
export class LanguageButton {
  constructor(scene, x, y, onToggle) {
    this.scene = scene;
    this.button = null;
    this.onToggle = onToggle;

    this.create(x, y);
  }

  create(x, y) {
    const currentLang = this.scene.registry.get('current_lang') || 'en';

    this.button = this.scene.add
      .text(x, y, currentLang.toUpperCase(), {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 },
        fixedWidth: 40,
        align: 'center',
      })
      .setOrigin(1, 1)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });

    this.button.on('pointerdown', () => this.toggle());
    this.button.on('pointerover', () =>
      this.button.setStyle({ fill: '#ffff00' }),
    );
    this.button.on('pointerout', () =>
      this.button.setStyle({ fill: '#ffffff' }),
    );
  }

  toggle() {
    const current = this.scene.registry.get('current_lang');
    const next = current === 'en' ? 'ru' : 'en';

    this.scene.registry.set('current_lang', next);
    const newData = this.scene.cache.json.get(`locale_${next}`);
    this.scene.registry.set('locale_data', newData);

    this.button.setText(next.toUpperCase());

    if (this.onToggle) {
      this.onToggle();
    }
  }
}