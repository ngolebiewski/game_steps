import { g } from './globals.js';

export default class Button {
  constructor({ text, x, y, width, height, onClick, color = "limegreen" }) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.onClick = onClick;

    this._clickHandler = (e) => {
      const rect = g.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const scaledX = (mx - g.offsetX) / g.scale;
      const scaledY = (my - g.offsetY) / g.scale;

      if (
        scaledX >= this.x &&
        scaledX <= this.x + this.width &&
        scaledY >= this.y &&
        scaledY <= this.y + this.height
      ) {
        this.onClick();
      }
    };

    g.canvas.addEventListener("click", this._clickHandler);
  }

  remove() {
    g.canvas.removeEventListener("click", this._clickHandler);
  }

  draw() {
    const ctx = g.bufferCtx;

    const prev = {
      fill: ctx.fillStyle,
      font: ctx.font,
      align: ctx.textAlign,
      baseline: ctx.textBaseline,
    };

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "black";
    ctx.font = "16px Courier";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

    Object.assign(ctx, prev);
  }
}
