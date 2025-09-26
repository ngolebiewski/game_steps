import { setBasicFont, getRandomIntBetween, drawText } from './util.js';

// --- Buffer setup ---
const BUFFER_WIDTH = 400;
const BUFFER_HEIGHT = 300;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Enhanced pixel-perfect settings for main canvas
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.oImageSmoothingEnabled = false;

const buffer = document.createElement("canvas");
buffer.width = BUFFER_WIDTH;
buffer.height = BUFFER_HEIGHT;
const bufferCtx = buffer.getContext("2d");

// Enhanced pixel-perfect settings for buffer canvas
bufferCtx.imageSmoothingEnabled = false;
bufferCtx.webkitImageSmoothingEnabled = false;
bufferCtx.mozImageSmoothingEnabled = false;
bufferCtx.msImageSmoothingEnabled = false;
bufferCtx.oImageSmoothingEnabled = false;

// --- Scaling variables ---
let scale = 1;
let offsetX = 0; // in CSS pixels
let offsetY = 0; // in CSS pixels
let dpr = window.devicePixelRatio || 1;
let cssWidth = window.innerWidth;  // current CSS width of canvas
let cssHeight = window.innerHeight; // current CSS height of canvas

function updateScale() {
  // CSS pixel size we want the canvas to occupy
  cssWidth = window.innerWidth;
  cssHeight = window.innerHeight;

  // Compute scaling factor to fit screen while maintaining 4:3 ratio
  const scaleX = cssWidth / BUFFER_WIDTH;
  const scaleY = cssHeight / BUFFER_HEIGHT;
  scale = Math.min(scaleX, scaleY);

  // --- Apply DPR-aware canvas size (device pixels) ---
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);

  // CSS size stays in CSS pixels so layout doesn't change
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  // Set transform so drawing coordinates are in CSS pixels (1 unit = 1 CSS px)
  // Using setTransform(dpr,0,0,dpr,0,0) maps CSS coordinates to device pixels.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Center buffer in canvas (CSS pixels)
  offsetX = (cssWidth - BUFFER_WIDTH * scale) / 2;
  offsetY = (cssHeight - BUFFER_HEIGHT * scale) / 2;

  // Reapply pixel-perfect flags (transform doesn't change them)
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.oImageSmoothingEnabled = false;
}
window.addEventListener("resize", updateScale);
updateScale();

// --- Global ---
let deathsCollected = 1;
const TILE_SIZE = 16;
const SCALE = 2;

// --- Characters ---
const characters = {
  wizard: { col: 0, row: 7 },
  cross:  { col: 4, row: 5 }
};

const tilesheet = new Image();
tilesheet.src = "tilemap_packed.png";

function drawCharacter(name, x, y) {
  const char = characters[name];
  if (!char) return;
  bufferCtx.drawImage(
    tilesheet,
    char.col * TILE_SIZE,
    char.row * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    Math.floor(x), // Floor coordinates for pixel alignment inside buffer
    Math.floor(y),
    TILE_SIZE * SCALE,
    TILE_SIZE * SCALE
  );
}

// --- Button ---
class Button {
  constructor(text, x, y, width, height, onClick, color = "limegreen") {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.onClick = onClick;

    this._clickHandler = (e) => {
      // Use client coords (CSS pixels) and the canvas bounding rect to map to CSS canvas coordinates
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left; // CSS px
      const my = e.clientY - rect.top;  // CSS px

      // Convert to buffer-space by removing the offset and dividing by the scale (all in CSS px)
      const scaledX = (mx - offsetX) / scale;
      const scaledY = (my - offsetY) / scale;

      if (
        scaledX >= this.x &&
        scaledX <= this.x + this.width &&
        scaledY >= this.y &&
        scaledY <= this.y + this.height
      ) {
        this.onClick();
      }
    };

    canvas.addEventListener("click", this._clickHandler);
  }

  remove() {
    canvas.removeEventListener("click", this._clickHandler);
  }

  draw(ctx) {
    const prev = {
      fill: ctx.fillStyle,
      font: ctx.font,
      align: ctx.textAlign,
      baseline: ctx.textBaseline
    };

    // Draw into the buffer (buffer ctx is used by Levels)
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

    ctx.fillStyle = prev.fill;
    ctx.font = prev.font;
    ctx.textAlign = prev.align;
    ctx.textBaseline = prev.baseline;
  }
}

// Note: Button.draw() expects to be called with the bufferCtx (i.e., draws into buffer).

// --- Level ---
class Level {
  constructor(name, text) {
    this.name = name;
    this.text = text;
    this.button = null;
    this.onUpdate = null;
    this.onDraw = null;
  }

  init() {
    if (this.buttonConfig) {
      this.button = new Button(
        this.buttonConfig.text,
        this.buttonConfig.x,
        this.buttonConfig.y,
        this.buttonConfig.width,
        this.buttonConfig.height,
        this.buttonConfig.onClick,
        this.buttonConfig.color
      );
    }
    if (this.start) this.start();
  }

  destroy() {
    if (this.button) this.button.remove();
  }

  update() {
    if (this.onUpdate) this.onUpdate();
  }

  draw() {
    bufferCtx.clearRect(0, 0, BUFFER_WIDTH, BUFFER_HEIGHT);
    setBasicFont(bufferCtx);
    bufferCtx.fillText(this.text, 0, 0);

    if (this.button) this.button.draw(bufferCtx);
    if (this.onDraw) this.onDraw();
  }
}

// --- SceneManager ---
class SceneManager {
  constructor() {
    this.scene = null;
  }

  changeScene(scene) {
    if (this.scene) this.scene.destroy();
    this.scene = scene;
    this.scene.init();
  }
}
const sceneManager = new SceneManager();

// --- Keyboard ---
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// --- Scenes ---
const titleScene = new Level("title", "GAME_EXPERIMENT_02");
const sceneOne = new Level("level_01", "MEET YOUR FATE");
const endScene = new Level("end", "YOU WIN, GAME OVER");

// --- Character positions ---
const wizardPos = { x: 16, y: 265 };
const crossPos = { x: 360, y: 265 };
const MOVE_SPEED = 0.9 * SCALE;

sceneOne.onUpdate = () => {
  if (keys["ArrowLeft"]) wizardPos.x -= MOVE_SPEED;
  if (keys["ArrowRight"]) wizardPos.x += MOVE_SPEED;
  if (keys["ArrowUp"]) wizardPos.y -= MOVE_SPEED;
  if (keys["ArrowDown"]) wizardPos.y += MOVE_SPEED;

  // Floor positions for pixel alignment
  wizardPos.x = Math.floor(Math.max(0, Math.min(BUFFER_WIDTH - TILE_SIZE * SCALE, wizardPos.x)));
  wizardPos.y = Math.floor(Math.max(0, Math.min(BUFFER_HEIGHT - TILE_SIZE * SCALE, wizardPos.y)));

  if (
    wizardPos.x < crossPos.x + TILE_SIZE * SCALE &&
    wizardPos.x + TILE_SIZE * SCALE > crossPos.x &&
    wizardPos.y < crossPos.y + TILE_SIZE * SCALE &&
    wizardPos.y + TILE_SIZE * SCALE > crossPos.y
  ) {
    sceneManager.changeScene(endScene);
  }
};

sceneOne.onDraw = () => {
  drawCharacter("cross", crossPos.x, crossPos.y);
  drawCharacter("wizard", wizardPos.x, wizardPos.y);
};

endScene.onDraw = () => {
  drawText(
    bufferCtx,
    `✟ collected: ${deathsCollected}`,
    BUFFER_WIDTH / 2,
    100,
    "20px Futura",
    "red",
    "center",
    "top"
  );
};

// --- Buttons ---
titleScene.buttonConfig = {
  text: "START",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: () => sceneManager.changeScene(sceneOne),
  color: "green"
};

endScene.buttonConfig = {
  text: "PLAY AGAIN",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: () => {
    deathsCollected++;
    sceneManager.changeScene(sceneOne);
    wizardPos.x = 16;
    wizardPos.y = 265;
    crossPos.x = getRandomIntBetween(40, 360);
    crossPos.y = getRandomIntBetween(35, 265);
  },
  color: "purple"
};

// --- Start game ---
sceneManager.changeScene(titleScene);

// --- Game loop ---
function gameLoop() {
  if (sceneManager.scene) {
    sceneManager.scene.update();
    sceneManager.scene.draw();
  }

  // IMPORTANT: use CSS pixel dims here (ctx is transformed so coords are CSS px)
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Pixel-perfect rendering: draw buffer (buffer is 400x300) into CSS-space
  ctx.drawImage(
    buffer,
    0, 0, BUFFER_WIDTH, BUFFER_HEIGHT,
    offsetX, offsetY,
    BUFFER_WIDTH * scale, BUFFER_HEIGHT * scale
  );

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
