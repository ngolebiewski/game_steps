// set up canvas

const canvas = document.getElementById("game");
canvas.width = 400;
canvas.height = 300;
canvas.style.backgroundColor = "#222222";
const ctx = canvas.getContext("2d");

// Set text properties
function setBasicFont(ctx) {
  ctx.font = "30px Courier"; // font size and family
  ctx.fillStyle = "white"; // color of the text
  ctx.textAlign = "left"; // alignment: start, center, end
  ctx.textBaseline = "top"; // vertical alignment
}

const defaultCtx = ctx;
const defaultCanvas = canvas;

class Level {
  constructor(
    name,
    text,
    button = null,
    ctx = defaultCtx,
    canvas = defaultCanvas
  ) {
    this.name = name;
    this.text = text;
    this.ctx = ctx;
    this.canvas = canvas;
    this.button = button;
  }

  init() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    setBasicFont(ctx);
    this.ctx.fillText(this.text, 0, 0);
    // Create button only when scene is initialized
    if (this.buttonConfig) {
      this.button = new Button(
        this.buttonConfig.text,
        this.buttonConfig.x,
        this.buttonConfig.y,
        this.buttonConfig.width,
        this.buttonConfig.height,
        this.buttonConfig.onClick,
        this.buttonConfig.color,
        this.buttonConfig.canvas
      );
      this.button.draw(this.ctx);
    }
  }

  destroy() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.button) {
      this.button.remove(); // clean up event listener
    }
  }
}

class SceneManager {
  constructor() {
    this.scene = null;
  }

  changeScene(scene) {
    if (this.scene) {
      this.scene.destroy();
    }
    this.scene = scene;
    this.scene.init();
  }
}

class Button {
  constructor(
    text,
    x,
    y,
    width = 60,
    height = 20,
    onClick,
    color = "limegreen",
    canvas = defaultCanvas
  ) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.onClick = onClick; // function
    this.canvas = canvas;

    this._clickHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      if (this.isClicked(mouseX, mouseY)) {
        this.onClick();
      }
    };

    this.canvas.addEventListener("click", this._clickHandler);
  }

  remove() {
    this.canvas.removeEventListener("click", this._clickHandler);
  }

  isClicked(mouseX, mouseY) {
    return (
      mouseX >= this.x &&
      mouseX <= this.x + this.width &&
      mouseY >= this.y &&
      mouseY <= this.y + this.height
    );
  }

  draw(ctx) {
    // Save current context settings
    const prevFillStyle = ctx.fillStyle;
    const prevFont = ctx.font;
    const prevTextAlign = ctx.textAlign;
    const prevTextBaseline = ctx.textBaseline;

    // Draw button background
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw button border
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Draw button text
    ctx.fillStyle = "black";
    ctx.font = "16px Courier";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);

    // Restore context settings
    ctx.fillStyle = prevFillStyle;
    ctx.font = prevFont;
    ctx.textAlign = prevTextAlign;
    ctx.textBaseline = prevTextBaseline;
  }
}

function buttonClick(level) {
  return () => {
    sceneManager.changeScene(level);
  };
}

// Create scene manager
const sceneManager = new SceneManager();

// Create scenes with button configurations (not actual buttons yet)
const titleScene = new Level("title", "SCENE EXPERIMENT GAME");
const sceneOne = new Level("level_01", "LEVEL 1");
const endScene = new Level("end", "GAME OVER");

// Set up button configurations for each scene
titleScene.buttonConfig = {
  text: "START",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: buttonClick(sceneOne),
  color: "green",
  canvas: canvas,
};

sceneOne.buttonConfig = {
  text: "END GAME",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: buttonClick(endScene),
  color: "red",
  canvas: canvas,
};

endScene.buttonConfig = {
  text: "PLAY AGAIN",
  x: 150,
  y: 150,
  width: 120,
  height: 50,
  onClick: buttonClick(titleScene),
  color: "purple",
  canvas: canvas,
};

// Start the game
sceneManager.changeScene(titleScene);
