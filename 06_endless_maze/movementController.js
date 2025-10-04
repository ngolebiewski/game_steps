export default class MovementController {
  constructor(speed = 1) {
    this.speed = speed;
    this.dx = 0;
    this.dy = 0;

    this.keys = {};
    this.touchStart = null;

    this.initKeyboard();
    this.initTouch();
  }

  initKeyboard() {
    window.addEventListener("keydown", e => {
      this.keys[e.key] = true;
      this.updateDirection();
    });

    window.addEventListener("keyup", e => {
      this.keys[e.key] = false;
      this.updateDirection();
    });
  }

  initTouch() {
    // Basic swipe detection for mobile
    window.addEventListener("touchstart", e => {
      if (!e.touches.length) return;
      const t = e.touches[0];
      this.touchStart = { x: t.clientX, y: t.clientY };
    });

    window.addEventListener("touchmove", e => {
      if (!e.touches.length || !this.touchStart) return;
      const t = e.touches[0];
      const dx = t.clientX - this.touchStart.x;
      const dy = t.clientY - this.touchStart.y;

      // threshold for swipe
      const threshold = 20;
      this.dx = Math.abs(dx) > threshold ? Math.sign(dx) * this.speed : 0;
      this.dy = Math.abs(dy) > threshold ? Math.sign(dy) * this.speed : 0;
    });

    window.addEventListener("touchend", () => {
      this.dx = 0;
      this.dy = 0;
      this.touchStart = null;
    });
  }

  updateDirection() {
    this.dx = 0;
    this.dy = 0;
    if (this.keys["ArrowLeft"]) this.dx -= this.speed;
    if (this.keys["ArrowRight"]) this.dx += this.speed;
    if (this.keys["ArrowUp"]) this.dy -= this.speed;
    if (this.keys["ArrowDown"]) this.dy += this.speed;
  }

  getMovement() {
    return { dx: this.dx, dy: this.dy };
  }
}
