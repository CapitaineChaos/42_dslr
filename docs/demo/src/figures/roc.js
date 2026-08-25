// Courbe ROC du groupe d'apprentissage : taux de vrais positifs contre taux de
// faux positifs, obtenus en balayant le seuil de décision.
//
// Les scores ex aequo sont traités par groupes, sans quoi la courbe montrerait
// des marches que l'ordre de lecture du fichier aurait seul décidées. À
// l'itération 0 tous les scores valent 0 : la courbe se réduit à la diagonale.

import { ROWS, Y, wAt } from '../dataset.js';
import { score } from '../model.js';
import { clip, frame, grid, marker } from './canevas.js';

const POSITIVES = Y.reduce((total, y) => total + y, 0);
const NEGATIVES = Y.length - POSITIVES;

function curve(t) {
  const weights = wAt(t);
  const rows = ROWS.map((row, i) => ({ z: score(weights, row), y: Y[i] }));
  rows.sort((a, b) => b.z - a.z);

  const points = [[0, 0]];
  let truePositives = 0;
  let falsePositives = 0;
  let index = 0;
  while (index < rows.length) {
    const level = rows[index].z;
    while (index < rows.length && rows[index].z === level) {
      if (rows[index].y === 1) truePositives += 1;
      else falsePositives += 1;
      index += 1;
    }
    points.push([falsePositives / NEGATIVES, truePositives / POSITIVES]);
  }

  let area = 0;
  for (let i = 1; i < points.length; i += 1) {
    area += ((points[i][0] - points[i - 1][0]) * (points[i][1] + points[i - 1][1])) / 2;
  }
  return { points, area };
}

// Le point de fonctionnement du seuil courant, tau = 1/2, soit z > 0.
function operating(t) {
  const weights = wAt(t);
  let truePositives = 0;
  let falsePositives = 0;
  ROWS.forEach((row, i) => {
    if (score(weights, row) > 0) {
      if (Y[i] === 1) truePositives += 1;
      else falsePositives += 1;
    }
  });
  return [falsePositives / NEGATIVES, truePositives / POSITIVES];
}

export const roc = {
  key: 'roc',
  label: 'ROC',

  draw(ctx, w, h, p, t) {
    // Les deux axes portent des taux : la zone de tracé est carrée, sinon la
    // diagonale de référence ne serait plus à 45 degrés.
    const base = { l: 46, r: 12, t: 12, b: 34 };
    const innerW = w - base.l - base.r;
    const innerH = h - base.t - base.b;
    const side = Math.min(innerW, innerH);
    const f = frame(w, h, {
      l: base.l + (innerW - side) / 2,
      r: base.r + (innerW - side) / 2,
      t: base.t + (innerH - side) / 2,
      b: base.b + (innerH - side) / 2,
    });

    grid(ctx, p, f, 0, 1, 0, 1, 'faux positifs', 'vrais positifs');

    clip(ctx, f, () => {
      ctx.strokeStyle = p.grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(f.x(0, 0, 1), f.y(0, 0, 1));
      ctx.lineTo(f.x(1, 0, 1), f.y(1, 0, 1));
      ctx.stroke();
      ctx.setLineDash([]);

      const { points } = curve(t);
      ctx.strokeStyle = p.trace;
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach(([x, y], i) => {
        const px = f.x(x, 0, 1);
        const py = f.y(y, 0, 1);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      const [x, y] = operating(t);
      ctx.fillStyle = p.trace;
      marker(ctx, f.x(x, 0, 1), f.y(y, 0, 1), true, 4.5);
    });
  },

  describe(t) {
    const [x, y] = operating(t);
    return `Courbe ROC du groupe d'apprentissage à l'itération ${t}, aire ${curve(t).area.toFixed(3)}. Le carré marque le seuil un demi, en (${x.toFixed(2)}, ${y.toFixed(2)}).`;
  },

  note: (t) => `aire = ${curve(t).area.toFixed(3)}`,
};
