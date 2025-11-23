// src/components/DiarySystem.js
import { BaseUIComponent } from './BaseUIComponent.js';
import { DIARY_LAYOUT, DIARY_STYLES } from '../config/diaryConfig.js';

export class DiarySystem extends BaseUIComponent {
  constructor(scene) {
    super(scene, DIARY_LAYOUT, DIARY_STYLES);
    this.entriesContainer = null;
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

    const day = this.scene.registry.get('dayCount') || 1;
    const itemsLost = this.scene.registry.get('itemsLost');

    let currentY = this.styles.startY;
    const startX = this.styles.startX;

    this.addEntry(startX, currentY, 'diary_day1_title', 'diary_day1_text');
    currentY += 120;

    if (day >= 2) {
      this.addEntry(startX, currentY, 'diary_day2_title', 'diary_day2_text');
      currentY += 100;
    }

    if (itemsLost) {
      this.addEntry(startX, currentY, 'diary_quest_title', 'diary_quest_bag');
      currentY += 80;
    }
  }

  addEntry(x, y, titleKey, bodyKey) {
    const titleStyle = this.styles.entryTitle;
    const bodyStyle = this.styles.entryBody;

    const title = this.scene.add.text(x, y, this.getText(titleKey), {
      fontSize: titleStyle.fontSize,
      fontStyle: titleStyle.fontStyle,
      fill: titleStyle.fill,
      fontFamily: titleStyle.fontFamily,
    });

    const body = this.scene.add.text(x, y + 25, this.getText(bodyKey), {
      fontSize: bodyStyle.fontSize,
      fontStyle: bodyStyle.fontStyle,
      fill: bodyStyle.fill,
      fontFamily: bodyStyle.fontFamily,
      wordWrap: { width: bodyStyle.wordWrapWidth },
    });

    this.entriesContainer.add([title, body]);
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
