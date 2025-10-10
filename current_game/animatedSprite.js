import Sprite from './sprite.js';
import { g } from './globals.js';

export default class AnimatedSprite extends Sprite {
  constructor(name, tilesheet, frameWidth, frameHeight, framesPerRow, animations, scale = 1, mover = null) {
    super(name, tilesheet, 0, 0, frameWidth, scale, mover);

    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesPerRow = framesPerRow;
    this.animations = animations; // e.g. { flicker: 0, burnDown: 1, out: 2 }

    this.currentAnim = 'flicker';
    this.currentFrame = 0;
    this.frameTime = 100; // ms per frame
    this.timeAccumulator = 0;
  }

  setAnimation(name) {
    if (this.animations[name] !== undefined) {
      this.currentAnim = name;
      this.currentFrame = 0;
      this.timeAccumulator = 0;
    }
  }

  update(dt = 16.67) {
    super.update();
    this.timeAccumulator += dt;
    if (this.timeAccumulator > this.frameTime) {
      this.currentFrame = (this.currentFrame + 1) % this.framesPerRow;
      this.timeAccumulator = 0;
    }
  }

  draw(ctx = g.bufferCtx) {
    const row = this.animations[this.currentAnim];
    const sx = this.currentFrame * this.frameWidth;
    const sy = row * this.frameHeight;

    ctx.drawImage(
      this.tilesheet,
      sx, sy, this.frameWidth, this.frameHeight,
      Math.floor(this.x),
      Math.floor(this.y),
      this.frameWidth * this.scale,
      this.frameHeight * this.scale
    );
  }
}
