import { getRandomIntBetween, drawText } from './util.js';
import { playCross, playBonk, playStart, startSong } from './sounds.js';
import Level from './level.js';
import SceneManager from './sceneManager.js';
import GameView from './gameView.js';
import { g } from './globals.js';
import MovementController from './movementController.js';
import Sprite from './sprite.js';

// --- Setup GameView ---
const gameView = new GameView("game"); 

// --- Scene Manager ---
const sceneManager = new SceneManager();

// --- Globals ---
const TILE_SIZE = 16;
const SCALE = 2;

// --- Maze settings ---
const COLS = Math.floor(g.BUFFER_WIDTH / (TILE_SIZE * SCALE));
const ROWS = Math.floor(g.BUFFER_HEIGHT / (TILE_SIZE * SCALE));
let maze = []; // 2D array (0 = floor, 1 = wall)

// --- Characters ---
const tilesheet = new Image();
tilesheet.src = "tilemap_packed.png";

const wizard = new Sprite("wizard", tilesheet, 0, 7, TILE_SIZE, SCALE);
const cross = new Sprite("cross", tilesheet, 4, 5, TILE_SIZE, SCALE);
const wall = new Sprite("wall", tilesheet, 4,3, TILE_SIZE, SCALE);

// --- Movement Controller ---
const wizardMover = new MovementController(1.2 * SCALE);

// --- Scenes ---
const titleScene = new Level("title", "GAME_EXPERIMENT_5");
const sceneOne = new Level("level_01", "MEET YOUR FATE");
const endScene = new Level("end", "YOU WIN, GAME OVER");

// --- Maze Generator ---
function generateMaze(rows, cols) {
  let grid = Array.from({ length: rows }, () => Array(cols).fill(1));

  function carve(x, y) {
    grid[y][x] = 0;
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        ny > 0 && ny < rows - 1 &&
        nx > 0 && nx < cols - 1 &&
        grid[ny][nx] === 1
      ) {
        grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);

  // Borders = walls
  for (let y = 0; y < rows; y++) {
    grid[y][0] = grid[y][cols - 1] = 1;
  }
  for (let x = 0; x < cols; x++) {
    grid[0][x] = grid[rows - 1][x] = 1;
  }

  return grid;
}

// --- BFS flood fill: find reachable cells ---
function getReachableCells(startRow, startCol) {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const queue = [[startRow, startCol]];
  visited[startRow][startCol] = true;
  const reachable = [];

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    reachable.push([r, c]);

    const neighbors = [
      [r - 1, c], [r + 1, c],
      [r, c - 1], [r, c + 1]
    ];

    for (const [nr, nc] of neighbors) {
      if (
        nr >= 0 && nr < ROWS &&
        nc >= 0 && nc < COLS &&
        !visited[nr][nc] &&
        maze[nr][nc] === 0
      ) {
        visited[nr][nc] = true;
        queue.push([nr, nc]);
      }
    }
  }

  return reachable;
}

// --- Scene start/reset logic ---
sceneOne.start = () => {
  maze = generateMaze(ROWS, COLS);

  // Pick a random empty floor tile for wizard
  let startRow, startCol;
  do {
    startRow = getRandomIntBetween(1, ROWS - 2);
    startCol = getRandomIntBetween(1, COLS - 2);
  } while (maze[startRow][startCol] !== 0);

  wizard.setPosition(startCol * TILE_SIZE * SCALE, startRow * TILE_SIZE * SCALE);

  // Place cross in a reachable spot from wizard’s tile
  const reachable = getReachableCells(startRow, startCol);
  const [crossRow, crossCol] = reachable[Math.floor(Math.random() * reachable.length)];
  cross.setPosition(crossCol * TILE_SIZE * SCALE, crossRow * TILE_SIZE * SCALE);
};

// --- Scene update ---
sceneOne.onUpdate = () => {
  const move = wizardMover.getMovement();
  let newX = wizard.x + move.dx;
  let newY = wizard.y + move.dy;

  const spriteSize = TILE_SIZE * SCALE;

  function collides(x, y) {
    const col = Math.floor(x / spriteSize);
    const row = Math.floor(y / spriteSize);
    return maze[row] && maze[row][col] === 1;
  }

  function isBlocked(x, y) {
    const left = x+2;
    const right = x + spriteSize - 4;
    const top = y+2;
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

  // Collision with cross
  if (wizard.collidesWith(cross)) {
    playCross();
    sceneManager.changeScene(endScene);
  }
};



// --- Scene draw ---
sceneOne.onDraw = () => {
  // Draw maze
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (maze[row][col] === 1) {
        wall.setPosition(col * TILE_SIZE * SCALE, row * TILE_SIZE * SCALE);
        wall.draw();
      }
    }
  }

  // Draw characters
  cross.draw();
  wizard.draw();
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
    g.deathsCollected++;
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

requestAnimationFrame(gameLoop);
