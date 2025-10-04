import { getRandomIntBetween, drawText } from './util.js';
import { playCross, playStart, startSong } from './sounds.js';
import Level from './level.js';
import SceneManager from './sceneManager.js';
import GameView from './gameView.js';
import { g } from './globals.js';
import MovementController from './movementController.js';
import Sprite from './sprite.js';
import Camera from './camera.js';
import MazeGenerator from './mazeGenerator.js';

// --- Setup GameView ---
const gameView = new GameView("game");

// --- Scene Manager ---
const sceneManager = new SceneManager();

// Base maze size (relative to screen)
const BASE_COLS = Math.floor(g.BUFFER_WIDTH / (g.TILE_SIZE * g.SCALE));
const BASE_ROWS = Math.floor(g.BUFFER_HEIGHT / (g.TILE_SIZE * g.SCALE));

let currentLevel = 1;
let ROWS, COLS;

// --- Camera ---
const camera = new Camera();

// --- Characters ---
const tilesheet = new Image();
tilesheet.src = "tilemap_packed.png";

const wizard = new Sprite("wizard", tilesheet, 0, 7, g.TILE_SIZE, g.SCALE);
const cross = new Sprite("cross", tilesheet, 4, 5, g.TILE_SIZE, g.SCALE);
const wall = new Sprite("wall", tilesheet, 4, 3, g.TILE_SIZE, g.SCALE);

// Movement controller (speed will be adjusted each level)
let wizardMover = new MovementController(1.2 * g.SCALE);

// --- Scenes ---
const titleScene = new Level("title", "The Endless Maze");
const sceneOne = new Level("level_01", "");
const endScene = new Level("end", "YOU WIN, GAME OVER");

// --- Maze Generator ---
const mazeGen = new MazeGenerator();

// --- Scene start/reset logic ---
sceneOne.start = () => {
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

  wizard.setPosition(startCol * g.TILE_SIZE * g.SCALE, startRow * g.TILE_SIZE * g.SCALE);

  // Place cross in reachable spot
  const reachable = mazeGen.getReachableCells(startRow, startCol);
  const [crossRow, crossCol] = reachable[Math.floor(Math.random() * reachable.length)];
  cross.setPosition(crossCol * g.TILE_SIZE * g.SCALE, crossRow * g.TILE_SIZE * g.SCALE);

  camera.centerOn(wizard, COLS, ROWS);
};

// --- Scene update ---
sceneOne.onUpdate = () => {
  const move = wizardMover.getMovement();
  let newX = wizard.x + move.dx;
  let newY = wizard.y + move.dy;

  const spriteSize = g.TILE_SIZE * g.SCALE;

  function collides(x, y) {
    const col = Math.floor(x / spriteSize);
    const row = Math.floor(y / spriteSize);
    return mazeGen.maze[row] && mazeGen.maze[row][col] === 1;
  }

  function isBlocked(x, y) {
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
  }

  // Try horizontal move
  if (!isBlocked(newX, wizard.y)) {
    wizard.x = newX;
  }

  // Try vertical move
  if (!isBlocked(wizard.x, newY)) {
    wizard.y = newY;
  }

  // Update camera to follow wizard
  camera.centerOn(wizard, COLS, ROWS);

  // Collision with cross
  if (wizard.collidesWith(cross)) {
    playCross();
    g.deathsCollected++;
    currentLevel++; // bigger + faster next time
    console.log('Current Level: ', currentLevel, '✟ collected:', g.deathsCollected);
    sceneManager.changeScene(sceneOne);
    sceneOne.start();
  }
};

// --- Scene draw ---
sceneOne.onDraw = () => {
  // Draw maze with camera offset
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

  // Draw characters (offset by camera)
  camera.applyTo(cross);
  cross.draw();
  camera.reset(cross);

  camera.applyTo(wizard);
  wizard.draw();
  camera.reset(wizard);
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

// --- Game loop ---
function gameLoop() {
  if (sceneManager.scene) {
    sceneManager.scene.update();
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
