// globals.js
export const g = {
  BUFFER_WIDTH: 400,
  BUFFER_HEIGHT: 300,
  canvas: null,
  ctx: null,
  buffer: null,
  bufferCtx: null,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  dpr: window.devicePixelRatio || 1,
  cssWidth: window.innerWidth,
  cssHeight: window.innerHeight,
  deathsCollected: 1
};
