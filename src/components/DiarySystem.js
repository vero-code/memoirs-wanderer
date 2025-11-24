// src/components/DiarySystem.js
import { BaseUIComponent } from './BaseUIComponent.js';
import { DIARY_LAYOUT, DIARY_STYLES } from '../config/diaryConfig.js';

export class DiarySystem extends BaseUIComponent {
  constructor(scene) {
    super(scene, DIARY_LAYOUT, DIARY_STYLES);
    this.entriesContainer = null;
    this.contentHeight = 0;
    this.maskGraphics = null;
  }

  create() {
    this.createContainer(
      DIARY_LAYOUT.position.x,
      DIARY_LAYOUT.position.y,
      DIARY_LAYOUT.depth,
    );

    const bg = this.createBackground(DIARY_LAYOUT.background);
    this.container.add(bg);

    this.createTitle();

    this.entriesContainer = this.scene.add.container(0, 0);
    this.container.add(this.entriesContainer);
    this.createCloseButton();
    this.setupScrolling();
  }

  setupScrolling() {
    const viewport = this.layout.viewport;

    const maskX = this.layout.position.x - viewport.width / 2;
    const maskY = this.layout.position.y + viewport.y;

    this.maskGraphics = this.scene.make.graphics();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(maskX, maskY, viewport.width, viewport.height);

    const mask = this.maskGraphics.createGeometryMask();

    this.entriesContainer.setMask(mask);

    this.scene.input.on(
      'wheel',
      (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
        if (this.isOpen) {
          this.scroll(deltaY);
        }
      },
    );
  }

  scroll(deltaY) {
    const viewportHeight = this.layout.viewport.height;

    if (this.contentHeight <= viewportHeight) {
      this.entriesContainer.y = this.layout.viewport.y;
      return;
    }

    const scrollSpeed = 0.5;
    this.entriesContainer.y -= deltaY * scrollSpeed;

    const topBound = this.layout.viewport.y;
    if (this.entriesContainer.y > topBound) {
      this.entriesContainer.y = topBound;
    }

    const bottomBound = topBound - (this.contentHeight - viewportHeight) - 20;
    if (this.entriesContainer.y < bottomBound) {
      this.entriesContainer.y = bottomBound;
    }
  }

  createTitle() {
    const style = this.styles.title;
    this.titleText = this.scene.add
      .text(0, style.offsetY, this.getText('uiDiaryTitle'), {
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fill: style.fill,
        fontFamily: style.fontFamily,
      })
      .setOrigin(0.5);
    this.container.add(this.titleText);
  }

  refresh() {
    this.entriesContainer.removeAll(true);

    const registry = this.scene.registry;
    const day = registry.get('dayCount') || 1;
    const receivedPotato = registry.get('receivedFreePotato');
    const hasVisitedForest = registry.get('hasVisitedForest');
    const itemsLost = registry.get('itemsLost');

    const metArmorer = registry.get('metArmorer');

    let currentY = 0;
    const startX = this.styles.startX;
    const gap = 20;

    currentY = this.addEntry(
      startX,
      currentY,
      'diary_day1_title',
      'diary_day1_text',
    );
    currentY += gap;

    if (receivedPotato) {
      currentY = this.addEntry(startX, currentY, null, 'potato_day1_text');
      currentY += gap;
    }

    if (metArmorer) {
      currentY = this.addEntry(startX, currentY, null, 'shield_day1_text');
      currentY += gap;
    }

    if (hasVisitedForest) {
      currentY = this.addEntry(startX, currentY, null, 'forest_day1_text');
      currentY += gap;
    }

    if (day >= 2) {
      currentY = this.addEntry(startX, currentY, null, 'mountains_day1_text');
      currentY += gap + 10;
    }

    if (day >= 2 && itemsLost === false) {
      currentY = this.addEntry(
        startX,
        currentY,
        'rebirth_day2_title',
        'rebirth_day2_text',
      );
    }

    this.contentHeight = currentY;
    this.entriesContainer.y = this.layout.viewport.y;
  }

  addEntry(x, y, titleKey, bodyKey) {
    const titleStyle = this.styles.entryTitle;
    const bodyStyle = this.styles.entryBody;
    let nextY = y;

    if (titleKey) {
      const title = this.scene.add.text(x, nextY, this.getText(titleKey), {
        fontSize: titleStyle.fontSize,
        fontStyle: titleStyle.fontStyle,
        fill: titleStyle.fill,
        fontFamily: titleStyle.fontFamily,
      });
      this.entriesContainer.add(title);
      nextY += title.height + 5;
    }

    const body = this.scene.add.text(x, nextY, this.getText(bodyKey), {
      fontSize: bodyStyle.fontSize,
      fontStyle: bodyStyle.fontStyle,
      fill: bodyStyle.fill,
      fontFamily: bodyStyle.fontFamily,
      wordWrap: { width: bodyStyle.wordWrapWidth },
    });
    this.entriesContainer.add(body);

    return nextY + body.height;
  }

  createCloseButton() {
    const style = this.styles.closeButton;

    const closeBtn = this.scene.add
      .text(style.x, style.y, style.text, {
        fontSize: style.fontSize,
        fontStyle: style.fontStyle,
        fill: style.fill,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => {
      closeBtn.setStyle({ fill: style.fillHover });
    });

    closeBtn.on('pointerout', () => {
      closeBtn.setStyle({ fill: style.fill });
    });

    closeBtn.on('pointerdown', () => {
      this.toggle();
    });

    this.container.add(closeBtn);
  }

  toggle() {
    super.toggle();
    if (this.isOpen) {
      this.refresh();
    }
  }

  updateTexts() {
    if (this.titleText) this.titleText.setText(this.getText('uiDiaryTitle'));
    if (this.isOpen) this.refresh();
  }
}
