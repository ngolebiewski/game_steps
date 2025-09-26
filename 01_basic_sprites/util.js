// ./util.js

// --- Basic font helper ---
export function setBasicFont(ctx) {
  ctx.font = "30px Courier";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
}

export function getRandomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function drawText(ctx, text, x, y, sizeAndFont="10px Courier", color="white", align="left", baseline="top"){
  ctx.font = sizeAndFont;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}