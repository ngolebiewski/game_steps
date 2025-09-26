import { setBasicFont, getRandomIntBetween, drawText } from './util.js';

// --- Canvas setup ---
const canvas = document.getElementById("game");
canvas.width = 400;
canvas.height = 300;
canvas.style.backgroundColor = "#222222";
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false; // keep crisp pixels

// -- GLOBAL (FOR NOW)
let deathsCollected = 1

// --- Tile and character setup ---
const TILE_SIZE = 16;
const SCALE = 2;
const characters = {
  wizard: { col: 0, row: 7 },
  cross:  { col: 4, row: 5 }
};

const tilesheet = new Image();
tilesheet.src = "tilemap_packed.png";

function drawCharacter(name, x, y) {
  const char = characters[name];
  if (!char) return;
  ctx.drawImage(
    tilesheet,
    char.col * TILE_SIZE,
    char.row * TILE_SIZE,
    TILE_SIZE,
    TILE_SIZE,
    x,
    y,
    TILE_SIZE * SCALE,
    TILE_SIZE * SCALE
  );
}



// --- Button class ---
class Button {
  constructor(text, x, y, width, height, onClick, color="limegreen") {
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

// --- Level class with update/draw hooks ---
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

  destroy() { if (this.button) this.button.remove(); }

  update() { if (this.onUpdate) this.onUpdate(); }

  draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setBasicFont(ctx);
    ctx.fillText(this.text, 0, 0);
    if (this.button) this.button.draw(ctx);
    if (this.onDraw) this.onDraw();
  }
}

// --- SceneManager ---
class SceneManager {
  constructor() { this.scene = null; }
  changeScene(scene) {
    if (this.scene) this.scene.destroy();
    this.scene = scene;
    this.scene.init();
  }
}

const sceneManager = new SceneManager();

// --- Keyboard input ---
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// --- Scene setup ---
const titleScene = new Level("title", "GAME_EXPERIMENT_01");
const sceneOne   = new Level("level_01", "MEET YOUR FATE");
const endScene   = new Level("end", "YOU WIN, GAME OVER");

// --- Character positions ---
const wizardPos = { x: 16, y: 265 };
const crossPos  = { x: 360, y: 265 };
const MOVE_SPEED = .9 * SCALE;

// --- Scene One hooks ---
sceneOne.onUpdate = () => {
  if (keys["ArrowLeft"])  wizardPos.x -= MOVE_SPEED;
  if (keys["ArrowRight"]) wizardPos.x += MOVE_SPEED;
  if (keys["ArrowUp"])    wizardPos.y -= MOVE_SPEED;
  if (keys["ArrowDown"])  wizardPos.y += MOVE_SPEED;

  wizardPos.x = Math.max(0, Math.min(canvas.width - TILE_SIZE*SCALE, wizardPos.x));
  wizardPos.y = Math.max(0, Math.min(canvas.height - TILE_SIZE*SCALE, wizardPos.y));

  // Win condition
  if (wizardPos.x < crossPos.x + TILE_SIZE*SCALE &&
      wizardPos.x + TILE_SIZE*SCALE > crossPos.x &&
      wizardPos.y < crossPos.y + TILE_SIZE*SCALE &&
      wizardPos.y + TILE_SIZE*SCALE > crossPos.y) {
    sceneManager.changeScene(endScene);
  }
};

sceneOne.onDraw = () => {
  drawCharacter("cross", crossPos.x, crossPos.y);
  drawCharacter("wizard", wizardPos.x, wizardPos.y);
};

endScene.onDraw = () => {
  drawText(ctx, `✟ collected: ${deathsCollected}`, canvas.width/2,100,"20px Futura","red","center","top")
}
// --- Buttons ---
titleScene.buttonConfig = {
  text: "START", x:150, y:150, width:120, height:50,
  onClick: () => sceneManager.changeScene(sceneOne),
  color:"green"
};

endScene.buttonConfig = {
  text: "PLAY AGAIN", x:150, y:150, width:120, height:50,
  onClick: () => {
    deathsCollected++;
    sceneManager.changeScene(sceneOne);
    wizardPos.x=16;
    wizardPos.y=265;
    crossPos.x=getRandomIntBetween(40, 360);
    crossPos.y=getRandomIntBetween(35, 265);
  },
  color:"purple"
};

// --- Start game ---
sceneManager.changeScene(titleScene);

// --- Universal game loop ---
function gameLoop() {
  if (sceneManager.scene) {
    sceneManager.scene.update();
    sceneManager.scene.draw();
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

