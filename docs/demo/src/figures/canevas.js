// Outils communs aux quatre figures : palette, repère, grille, marqueurs.
//
// Aucune couleur n'est écrite ici : elles sont lues sur les jetons CSS, donc un
// changement de palette n'a rien à recompiler.

const TOKENS = [
  'surface', 'sunk', 'ink', 'ink-soft', 'ink-faint',
  'line', 'edge', 'grid', 'house-a', 'house-b', 'alert', 'trace',
];

const camel = (name) => name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase());

export function palette() {
  const style = getComputedStyle(document.documentElement);
  const out = {};
  TOKENS.forEach((name) => { out[camel(name)] = style.getPropertyValue(`--${name}`).trim(); });
  out.label = '12px ui-sans-serif, system-ui, sans-serif';
  return out;
}

function rgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

export function mix(hexA, hexB, ratio) {
  const a = rgb(hexA);
  const b = rgb(hexB);
  return `rgb(${a.map((value, i) => Math.round(value + (b[i] - value) * ratio)).join(',')})`;
}

export function frame(w, h, pad) {
  return {
    w, h, pad,
    x: (value, lo, hi) => pad.l + ((value - lo) / (hi - lo)) * (w - pad.l - pad.r),
    y: (value, lo, hi) => h - pad.b - ((value - lo) / (hi - lo)) * (h - pad.t - pad.b),
  };
}

export function niceStep(lo, hi) {
  const raw = (hi - lo) / 5;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = raw / magnitude;
  return (unit < 1.5 ? 1 : unit < 3 ? 2 : unit < 7 ? 5 : 10) * magnitude;
}

export function tick(value) {
  if (Math.abs(value) < 1e-9) return '0';
  const size = Math.abs(value);
  if (size < 1) return value.toFixed(1);
  if (size < 100) return String(Math.round(value * 10) / 10);
  return String(Math.round(value));
}

export function grid(ctx, p, f, xlo, xhi, ylo, yhi, xlabel, ylabel, yTicks = true) {
  ctx.save();
  ctx.strokeStyle = p.grid;
  ctx.fillStyle = p.inkFaint;
  ctx.lineWidth = 1;
  ctx.font = p.label;

  const xs = niceStep(xlo, xhi);
  for (let value = Math.ceil(xlo / xs) * xs; value <= xhi + 1e-9; value += xs) {
    const px = Math.round(f.x(value, xlo, xhi)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(px, f.pad.t);
    ctx.lineTo(px, f.h - f.pad.b);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillText(tick(value), px, f.h - f.pad.b + 15);
  }

  const ys = niceStep(ylo, yhi);
  for (let value = yTicks ? Math.ceil(ylo / ys) * ys : yhi + 1; value <= yhi + 1e-9; value += ys) {
    const py = Math.round(f.y(value, ylo, yhi)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(f.pad.l, py);
    ctx.lineTo(f.w - f.pad.r, py);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(tick(value), f.pad.l - 6, py + 4);
  }

  ctx.fillStyle = p.inkSoft;
  ctx.textAlign = 'center';
  ctx.fillText(xlabel, f.pad.l + (f.w - f.pad.l - f.pad.r) / 2, f.h - 3);
  ctx.translate(11, f.pad.t + (f.h - f.pad.t - f.pad.b) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(ylabel, 0, 0);
  ctx.restore();
}

export function clip(ctx, f, draw) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(f.pad.l, f.pad.t, f.w - f.pad.l - f.pad.r, f.h - f.pad.t - f.pad.b);
  ctx.clip();
  draw();
  ctx.restore();
}

// Carré pour la maison cible, disque pour les autres : la forme double la
// couleur, seul encodage lisible sans distinguer les teintes.
export function marker(ctx, px, py, positive, size) {
  ctx.beginPath();
  if (positive) ctx.rect(px - size, py - size, size * 2, size * 2);
  else ctx.arc(px, py, size, 0, 6.284);
  ctx.fill();
}

// Bornes élargies pour que les deux axes portent la même échelle : sans cela un
// angle droit ou une distance lus sur la figure seraient faux.
export function isotropic(f, w, h, ax, ay) {
  const inner = { w: w - f.pad.l - f.pad.r, h: h - f.pad.t - f.pad.b };
  const scale = Math.max((ax[1] - ax[0]) / inner.w, (ay[1] - ay[0]) / inner.h);
  const cx = (ax[0] + ax[1]) / 2;
  const cy = (ay[0] + ay[1]) / 2;
  return [
    cx - (scale * inner.w) / 2, cx + (scale * inner.w) / 2,
    cy - (scale * inner.h) / 2, cy + (scale * inner.h) / 2,
  ];
}
