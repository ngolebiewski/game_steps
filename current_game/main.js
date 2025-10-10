import { getRandomIntBetween, drawText, drawCandleLight } from './util.js';
import { playCandle, playCross, playStart, startSong } from './sounds.js';
import Level from './level.js';
import SceneManager from './sceneManager.js';
import GameView from './gameView.js';
import { g } from './globals.js';
import MovementController from './movementController.js';
import Sprite from './sprite.js';
import AnimatedSprite from './animatedSprite.js';
import Camera from './camera.js';
import MazeGenerator from './mazeGenerator.js';

///////////////////////
// --- Game Init --- //
///////////////////////

const gameView = new GameView("game");      // grabs canvas element from DOM and sets up the canvas buffer
const sceneManager = new SceneManager();    // scene controller - impt!

// Base maze size (relative to screen)
const BASE_COLS = Math.floor(g.BUFFER_WIDTH / (g.TILE_SIZE * g.SCALE));
const BASE_ROWS = Math.floor(g.BUFFER_HEIGHT / (g.TILE_SIZE * g.SCALE));
let currentLevel = 1;
let ROWS, COLS;

// Camera
const camera = new Camera();

// --- Characters + Sprites ---
// Could probably do this in a preload module?
const tilesheet = new Image();
tilesheet.src = "tilemap_packed.png";
const candleSheet = new Image();
candleSheet.src = "./art/candle.png";

const wizard = new Sprite("wizard", tilesheet, 0, 7, g.TILE_SIZE, g.SCALE);
const cross = new Sprite("cross", tilesheet, 4, 5, g.TILE_SIZE, g.SCALE);
const wall = new Sprite("wall", tilesheet, 4, 3, g.TILE_SIZE, g.SCALE);
const candles = []; // store candle animatedSprites

// Movement controller (speed will be adjusted each level)
let wizardMover = new MovementController(1.2 * g.SCALE);

// --- Scenes ---
const titleScene = new Level("title", "The Endless Maze");
const sceneOne = new Level("level_01", "");
const endScene = new Level("end", "YOU WIN, GAME OVER");

// --- Maze Generator ---
const mazeGen = new MazeGenerator();

///////////////////////
///////////////////////
///////////////////////

// --- Scene start/reset logic ---
sceneOne.start = () => {
  // Clear candles from previous level
  candles.length = 0;

  // Maze grows by +25% each level
  const growthFactor = 1 + (currentLevel - 1) * 0.25;
  ROWS = Math.floor(BASE_ROWS * growthFactor);
  COLS = Math.floor(BASE_COLS * growthFactor);

  mazeGen.generate(ROWS, COLS);

  // Speed grows by +5% each level
  const baseSpeed = 1.2 * g.SCALE;
  const speedFactor = 1 + (currentLevel - 1) * 0.05;
  wizardMover = new MovementController(baseSpeed * speedFactor);

  // Pick random empty floor tile for wizard
  let startRow, startCol;
  do {
    startRow = getRandomIntBetween(1, ROWS - 2);
    startCol = getRandomIntBetween(1, COLS - 2);
  } while (mazeGen.maze[startRow][startCol] !== 0);

  // Carves out chambers from the maze array.
  if (currentLevel > 2) mazeGen.makeRooms(currentLevel);

  wizard.setPosition(startCol * g.TILE_SIZE * g.SCALE, startRow * g.TILE_SIZE * g.SCALE);

  // Get reachable cells once
  const reachableCells = mazeGen.getReachableCells(startRow, startCol);

  // Place cross
  let [crossRow, crossCol] = reachableCells[Math.floor(Math.random() * reachableCells.length)];
  cross.setPosition(crossCol * g.TILE_SIZE * g.SCALE, crossRow * g.TILE_SIZE * g.SCALE);

  // Place candles
  for (let i = 0; i < currentLevel; i++) {
    const [cRow, cCol] = reachableCells[Math.floor(Math.random() * reachableCells.length)];
    const candle = new AnimatedSprite(
      "candle",
      candleSheet,
      16, 16, 8,
      { flicker: 0, burnDown: 1, out: 2 },
      g.SCALE / 2
    );
    candle.setPosition((cCol * g.TILE_SIZE * g.SCALE) + g.TILE_SIZE / 2, (cRow * g.TILE_SIZE * g.SCALE) + g.TILE_SIZE / 2);
    candles.push(candle);
  }

  camera.centerOn(wizard, COLS, ROWS);
};

// --- Scene update ---
sceneOne.onUpdate = (dt) => {
  if (!dt) dt = 16.67; // fallback

  // Update candles
  candles.forEach(c => c.update(dt));

  const move = wizardMover.getMovement();
  let newX = wizard.x + move.dx;
  let newY = wizard.y + move.dy;

  const spriteSize = g.TILE_SIZE * g.SCALE;

  const collides = (x, y) => {
    const col = Math.floor(x / spriteSize);
    const row = Math.floor(y / spriteSize);
    return mazeGen.maze[row] && mazeGen.maze[row][col] === 1;
  };

  const isBlocked = (x, y) => {
    const left = x + 4;
    const right = x + spriteSize - 4;
    const top = y + 4;
    const bottom = y + spriteSize - 4;
    return (
      collides(left, top) ||
      collides(right, top) ||
      collides(left, bottom) ||
      collides(right, bottom)
    );
  };

  // Move wizard
  if (!isBlocked(newX, wizard.y)) wizard.x = newX;
  if (!isBlocked(wizard.x, newY)) wizard.y = newY;

  camera.centerOn(wizard, COLS, ROWS);

  // Candle Collissions
  candles.forEach((c, index) => {
    if (wizard.collidesWith(c)) {
      playCandle()
      c.destroy();
      if (!c.active) candles.splice(index, 1);
      g.candlesCollected++
      console.log("🕯️ Candles Collected: ", g.candlesCollected)
    }
  });

  // Collision with cross — defer scene restart to next frame
  if (wizard.collidesWith(cross)) {
    playCross();
    g.deathsCollected++;
    currentLevel++;
    console.log('Level:', currentLevel, '✟ collected:', g.deathsCollected);

    // Use setTimeout to avoid freezing
    setTimeout(() => sceneOne.start(), 0);
  }
};

// --- Scene draw ---
sceneOne.onDraw = () => {
  // Draw maze
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (mazeGen.maze[row][col] === 1) {
        wall.setPosition(col * g.TILE_SIZE * g.SCALE, row * g.TILE_SIZE * g.SCALE);
        camera.applyTo(wall);
        wall.draw();
        camera.reset(wall);
      }
    }
  }

  // Draw cross
  camera.applyTo(cross);
  cross.draw();
  camera.reset(cross);

  // Draw candle lights
  candles.forEach(c => {
    const cx = c.x + c.frameWidth * c.scale / 2;
    const cy = c.y + c.frameHeight * c.scale / 2;
  });

  // Draw candles
  candles.forEach(c => {
    camera.applyTo(c);
    c.draw();
    camera.reset(c);
  });

  // Draw wizard
  camera.applyTo(wizard);
  wizard.draw();
  camera.reset(wizard);

  // --- HUD ---
  if (g.debugMode) {
    const ctx = g.bufferCtx;
    ctx.save();
    ctx.font = "10px Courier";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText(`Level: ${currentLevel}`, 10, 10);
    ctx.fillText(`Candles: ${g.candlesCollected}`, 10, 20);
    ctx.fillText(`Crosses: ${g.deathsCollected}`, 10, 30);
    // ctx.fillText(`Time: ${parseInt(g.dt)}`, 10, 40);

    ctx.restore();
  }

};

endScene.onDraw = () => {
  drawText(
    g.bufferCtx,
    `✟ collected: ${g.deathsCollected}`,
    g.BUFFER_WIDTH / 2,
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
  onClick: () => {
    playStart();
    startSong();
    sceneManager.changeScene(sceneOne);
    sceneOne.start();
  },
  color: "green",
};

endScene.buttonConfig = {
  text: "PLAY AGAIN",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: () => {
    playStart();
    sceneManager.changeScene(sceneOne);
    sceneOne.start();
  },
  color: "purple",
};

// --- Start game ---
sceneManager.changeScene(titleScene);

// --- Game loop with Delta Time (dt) ---
let lastTime = performance.now();

function gameLoop(now) {
  g.dt = Math.min(now - lastTime, 100);
  lastTime = now;

  if (sceneManager.scene) {
    sceneManager.scene.update(g.dt);
    sceneManager.scene.draw();
  }

  gameView.drawBufferToScreen();
  requestAnimationFrame(gameLoop);
}

// --- Quit shortcut ---
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "q") {
    sceneManager.changeScene(endScene);
  }
});

requestAnimationFrame(gameLoop);
