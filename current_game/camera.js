import { g } from "./globals.js";

export default class Camera {
  constructor(width = g.BUFFER_WIDTH, height = g.BUFFER_HEIGHT) {
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
  }

  centerOn(sprite, cols, rows) {
    // Center the camera on a given sprite (wizard, etc.)
    this.x = sprite.x - this.width / 2 + g.TILE_SIZE;
    this.y = sprite.y - this.height / 2 + g.TILE_SIZE;

    this.clamp(cols, rows);
  }

  clamp(cols, rows) {
    const maxX = cols * g.TILE_SIZE * g.SCALE - this.width;
    const maxY = rows * g.TILE_SIZE * g.SCALE - this.height;

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }

  applyTo(sprite) {
    // Temporarily offset sprite for drawing
    sprite.setPosition(sprite.x - this.x, sprite.y - this.y);
  }

  reset(sprite) {
    // Restore sprite’s actual world position
    sprite.setPosition(sprite.x + this.x, sprite.y + this.y);
  }
}
