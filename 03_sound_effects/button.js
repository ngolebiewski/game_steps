// --- Button class ---
export default class Button {
  constructor(text, x, y, width, height, onClick, canvas, color="limegreen") {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.onClick = onClick;

    this._clickHandler = e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      if (mx >= this.x && mx <= this.x+this.width &&
          my >= this.y && my <= this.y+this.height) {
        this.onClick();
      }
    };
    canvas.addEventListener("click", this._clickHandler);
  }

  remove() { canvas.removeEventListener("click", this._clickHandler); }

  draw(ctx) {
    const prev = {
      fill: ctx.fillStyle,
      font: ctx.font,
      align: ctx.textAlign,
      baseline: ctx.textBaseline
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
    ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2);
    ctx.fillStyle = prev.fill;
    ctx.font = prev.font;
    ctx.textAlign = prev.align;
    ctx.textBaseline = prev.baseline;
  }
}