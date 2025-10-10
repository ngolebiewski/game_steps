import { g } from './globals.js';

export default class Sprite {
  constructor(name, tilesheet, col, row, tileSize, scale = 1, mover = null, isCollectible = false) {
    this.name = name;
    this.tilesheet = tilesheet;
    this.col = col;   // tile column on tilesheet
    this.row = row;   // tile row on tilesheet
    this.tileSize = tileSize;
    this.scale = scale;
    this.mover = mover; // optional MovementController

    this.x = 0;
    this.y = 0;

    this.active = true; // for collisions/destroy method
    this.isCollectible = isCollectible; // can it be destroyed on collision
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  update() {
    if (!this.active) return;
    if (this.mover) {
      const move = this.mover.getMovement();
      this.x += move.dx;
      this.y += move.dy;

      // clamp to buffer
      this.x = Math.floor(Math.max(0, Math.min(g.BUFFER_WIDTH - this.tileSize * this.scale, this.x)));
      this.y = Math.floor(Math.max(0, Math.min(g.BUFFER_HEIGHT - this.tileSize * this.scale, this.y)));
    }
  }

  draw(ctx = g.bufferCtx) {
    ctx.drawImage(
      this.tilesheet,
      this.col * this.tileSize,
      this.row * this.tileSize,
      this.tileSize,
      this.tileSize,
      Math.floor(this.x),
      Math.floor(this.y),
      this.tileSize * this.scale,
      this.tileSize * this.scale
    );
  }

  // Simple collision check with another sprite
  collidesWith(other) {
    if (!this.active || !other.active) return false;

    return (
      this.x < other.x + other.tileSize * other.scale &&
      this.x + this.tileSize * this.scale > other.x &&
      this.y < other.y + other.tileSize * other.scale &&
      this.y + this.tileSize * this.scale > other.y
    );
  }

  destroy() {
    this.active = false;
  }
}
