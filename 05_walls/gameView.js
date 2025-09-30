import { g } from './globals.js';

export default class GameView {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.initCanvas();
    this.initBuffer();
    this.applyPixelPerfect([g.ctx, g.bufferCtx]);
    this.updateScale();
    window.addEventListener("resize", () => this.updateScale());
  }

  initCanvas() {
    g.canvas = document.getElementById(this.canvasId);
    g.ctx = g.canvas.getContext("2d");
  }

  initBuffer() {
    g.buffer = document.createElement("canvas");
    g.buffer.width = g.BUFFER_WIDTH;
    g.buffer.height = g.BUFFER_HEIGHT;
    g.bufferCtx = g.buffer.getContext("2d");
  }

  applyPixelPerfect(ctxs) {
    ctxs.forEach(ctx => {
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.webkitImageSmoothingEnabled = false;
      ctx.mozImageSmoothingEnabled = false;
      ctx.msImageSmoothingEnabled = false;
      ctx.oImageSmoothingEnabled = false;
    });
  }

  updateScale() {
    g.cssWidth = window.innerWidth;
    g.cssHeight = window.innerHeight;

    const scaleX = g.cssWidth / g.BUFFER_WIDTH;
    const scaleY = g.cssHeight / g.BUFFER_HEIGHT;
    g.scale = Math.min(scaleX, scaleY);

    g.dpr = window.devicePixelRatio || 1;
    g.canvas.width = Math.round(g.cssWidth * g.dpr);
    g.canvas.height = Math.round(g.cssHeight * g.dpr);

    g.canvas.style.width = `${g.cssWidth}px`;
    g.canvas.style.height = `${g.cssHeight}px`;

    g.ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
    g.offsetX = (g.cssWidth - g.BUFFER_WIDTH * g.scale) / 2;
    g.offsetY = (g.cssHeight - g.BUFFER_HEIGHT * g.scale) / 2;
  }

  clearBuffer() {
    g.bufferCtx.clearRect(0, 0, g.BUFFER_WIDTH, g.BUFFER_HEIGHT);
  }

  drawBufferToScreen() {
    g.ctx.fillStyle = "#222";
    g.ctx.fillRect(0, 0, g.cssWidth, g.cssHeight);

    g.ctx.drawImage(
      g.buffer,
      0, 0, g.BUFFER_WIDTH, g.BUFFER_HEIGHT,
      g.offsetX, g.offsetY,
      g.BUFFER_WIDTH * g.scale, g.BUFFER_HEIGHT * g.scale
    );
  }
}
