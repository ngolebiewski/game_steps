// globals.js

class Globals {
  constructor() {
    // Canvas / Buffer setup
    this.BUFFER_WIDTH = 400;
    this.BUFFER_HEIGHT = 300;
    this.canvas = null;
    this.ctx = null;
    this.buffer = null;
    this.bufferCtx = null;

    // Display and scaling
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.dpr = window.devicePixelRatio || 1;
    this.cssWidth = window.innerWidth;
    this.cssHeight = window.innerHeight;

    // Game state
    this.deathsCollected = 0;

    // Sprite / Tile info
    this.TILE_SIZE = 16;
    this.SCALE = 2;
  }

  // --- Derived values (helpers) ---
  get TILE_PIXELS() {
    return this.TILE_SIZE * this.SCALE;
  }

  get BUFFER_ASPECT() {
    return this.BUFFER_WIDTH / this.BUFFER_HEIGHT;
  }

  // --- Lifecycle helpers ---
  resetGame() {
    this.deathsCollected = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  resize(width, height) {
    this.cssWidth = width;
    this.cssHeight = height;
  }

  applyDPR(ctx) {
    if (!ctx) return;
    ctx.scale(this.dpr, this.dpr);
  }

  logStatus() {
    console.log(`🧭 g: ${this.cssWidth}x${this.cssHeight} | DPR=${this.dpr} | deaths=${this.deathsCollected}`);
  }
}

// Export a singleton instance (so old imports still work)
export const g = new Globals();

// Optional: also export the class itself for testing or multi-instance use
export default Globals;
