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

// --- Characters ---
const characters = {
  wizard: { col: 0, row: 7 },
  cross: { col: 4, row: 5 }
};

const tilesheet = new Image();
tilesheet.src = "tilemap_packed.png";

// --- Sprites ---
const wizard = new Sprite("wizard", tilesheet, 0, 7, TILE_SIZE, SCALE);
const cross = new Sprite("cross", tilesheet, 4, 5, TILE_SIZE, SCALE);

// --- Movement Controller ---
const wizardMover = new MovementController(1.2 * SCALE);

// --- Scenes ---
const titleScene = new Level("title", "GAME_EXPERIMENT_03");
const sceneOne = new Level("level_01", "MEET YOUR FATE");
const endScene = new Level("end", "YOU WIN, GAME OVER");

// --- Scene start/reset logic ---
sceneOne.start = () => {
  wizard.setPosition(16, 265);
  cross.setPosition(
    getRandomIntBetween(40, g.BUFFER_WIDTH - TILE_SIZE * SCALE),
    getRandomIntBetween(35, g.BUFFER_HEIGHT - TILE_SIZE * SCALE)
  );
};

// --- Scene update ---
sceneOne.onUpdate = () => {
  const move = wizardMover.getMovement();
  wizard.x += move.dx;
  wizard.y += move.dy;

  // Clamp to buffer
  wizard.x = Math.floor(Math.max(0, Math.min(g.BUFFER_WIDTH - TILE_SIZE * SCALE, wizard.x)));
  wizard.y = Math.floor(Math.max(0, Math.min(g.BUFFER_HEIGHT - TILE_SIZE * SCALE, wizard.y)));

  // Collision
  if (wizard.collidesWith(cross)) {
    playCross();
    sceneManager.changeScene(endScene);
  }
};

// --- Scene draw ---
sceneOne.onDraw = () => {
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
    sceneOne.start(); // reset positions and randomize cross
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
