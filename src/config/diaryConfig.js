// src/config/diaryConfig.js

export const DIARY_LAYOUT = {
  position: { x: 400, y: 300 },
  depth: 205,
  background: {
    width: 500,
    height: 400,
    color: 0xf5e6c4,
    alpha: 1,
    strokeWidth: 4,
    strokeColor: 0x5c4033,
  },
};

export const DIARY_STYLES = {
  title: {
    fontSize: '28px',
    fontStyle: 'bold',
    fill: '#3b2d25',
    fontFamily: 'serif',
    offsetY: -160,
  },
  entryTitle: {
    fontSize: '18px',
    fontStyle: 'bold',
    fill: '#5c4033',
    fontFamily: 'monospace',
  },
  entryBody: {
    fontSize: '16px',
    fontStyle: 'italic',
    fill: '#000000',
    fontFamily: 'serif',
    wordWrapWidth: 440,
  },
  closeButton: {
    text: '✕',
    fontSize: '18px',
    fontStyle: 'bold',
    fill: '#5c4033',
    fillHover: '#ff0000',
    x: 230,
    y: -180,
  },
  lineSpacing: 10,
  startX: -220,
  startY: -120,
};
