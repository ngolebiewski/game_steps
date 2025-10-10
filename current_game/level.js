import Button from './button.js';
import { setBasicFont } from './util.js';
import { g } from './globals.js';

export default class Level {
  constructor(name, text) {
    this.name = name;
    this.text = text;
    this.button = null;
    this.buttonConfig = null;
    this.start = null;
    this.onUpdate = null;
    this.onDraw = null;
  }

  init() {
    if (this.buttonConfig) {
      this.button = new Button(this.buttonConfig);
    }
    if (this.start) this.start();
  }

  destroy() {
    if (this.button) this.button.remove();
  }

  update(dt) {
    if (this.onUpdate) this.onUpdate(dt);
  }

  draw() {
    g.bufferCtx.clearRect(0, 0, g.BUFFER_WIDTH, g.BUFFER_HEIGHT);
    setBasicFont(g.bufferCtx);
    g.bufferCtx.fillText(this.text, 0, 0);

    if (this.button) this.button.draw();
    if (this.onDraw) this.onDraw();
  }
}
