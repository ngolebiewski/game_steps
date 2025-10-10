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

export function drawCandleLight(ctx, x, y, radius = 50, intensity = 0.5) {
  const flicker = 0.7 + Math.random() * 0.6; // 0.7 → 1.3 range
  const steps = 32; // number of points on the noisy circle
  const noiseAmount = radius * 0.15; // max deviation from circle

  ctx.save();
  ctx.beginPath();

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * noiseAmount; // add noise
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();

  // Radial gradient for smooth fading
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, `rgba(255, 220, 120, ${intensity * flicker})`);
  grad.addColorStop(0.4, `rgba(255, 160, 50, ${intensity * flicker * 0.6})`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}
