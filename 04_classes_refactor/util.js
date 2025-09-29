export function setBasicFont(ctx) {
  if (!ctx) return;
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

export function drawText(
  ctx,
  text,
  x,
  y,
  sizeAndFont = "10px Courier",
  color = "white",
  align = "left",
  baseline = "top"
) {
  if (!ctx) return;
  const prev = {
    font: ctx.font,
    fill: ctx.fillStyle,
    align: ctx.textAlign,
    baseline: ctx.textBaseline
  };

  ctx.font = sizeAndFont;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);

  ctx.font = prev.font;
  ctx.fillStyle = prev.fill;
  ctx.textAlign = prev.align;
  ctx.textBaseline = prev.baseline;
}
