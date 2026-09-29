// Le plan des deux notes. Pendant l'entraînement : le modèle de la maison en
// cours, fond teinté par sa probabilité et droite z = 0. Après la boucle des
// maisons : les trois modèles à l'arrêt, fond partagé entre les maisons du plus
// grand score. Les élèves portent la couleur de leur maison réelle.

import { STEPS } from '../content/steps.js';
import { AX, AY, COURSES, FEATURES, HOUSE, HOUSES, MODELS, N, ROWS, STATS, TRAIN, Y, wAt } from '../dataset.js';
import { argmax, errors, score, sigmoid } from '../model.js';
import { state } from '../state.js';
import { clip, frame, grid, isotropic, marker, mix } from './canevas.js';

const axisLabel = (index) => STATS[COURSES[index]].label;
const decided = () => ['post', 'valid', 'aval'].includes(STEPS[state.step].phase);

function line(ctx, f, p, weights, bounds, color = p.trace) {
  const [X0, X1, Y0, Y1] = bounds;
  if (Math.abs(weights[1]) < 1e-9 && Math.abs(weights[2]) < 1e-9) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (Math.abs(weights[2]) > 1e-9) {
    const at = (x) => -(weights[0] + weights[1] * x) / weights[2];
    ctx.moveTo(f.x(X0, X0, X1), f.y(at(X0), Y0, Y1));
    ctx.lineTo(f.x(X1, X0, X1), f.y(at(X1), Y0, Y1));
  } else {
    const vertical = -weights[0] / weights[1];
    ctx.moveTo(f.x(vertical, X0, X1), f.y(Y0, Y0, Y1));
    ctx.lineTo(f.x(vertical, X0, X1), f.y(Y1, Y0, Y1));
  }
  ctx.stroke();
}

function shade(ctx, f, bounds, tint) {
  const [X0, X1, Y0, Y1] = bounds;
  const cell = 8;
  const x0 = f.pad.l;
  const y0 = f.pad.t;
  const x1 = f.w - f.pad.r;
  const y1 = f.h - f.pad.b;
  ctx.globalAlpha = 0.45;
  for (let px = x0; px < x1; px += cell) {
    for (let py = y0; py < y1; py += cell) {
      const vx = X0 + ((px + cell / 2 - x0) / (x1 - x0)) * (X1 - X0);
      const vy = Y1 - ((py + cell / 2 - y0) / (y1 - y0)) * (Y1 - Y0);
      ctx.fillStyle = tint(vx, vy);
      ctx.fillRect(px, py, cell, cell);
    }
  }
  ctx.globalAlpha = 1;
}

function ring(ctx, p, px, py) {
  ctx.strokeStyle = p.alert;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 7.5, 0, 6.284);
  ctx.stroke();
}

export const frontiere = {
  key: 'frontiere',
  label: 'Frontière',

  draw(ctx, w, h, p, t) {
    const f = frame(w, h, { l: 46, r: 12, t: 12, b: 34 });

    // En coordonnées standardisées, une distance dans le plan a un sens et
    // l'angle de la frontière doit être respecté.
    const bounds = isotropic(f, w, h, AX, AY);
    grid(ctx, p, f, ...bounds, axisLabel(0), axisLabel(1));

    clip(ctx, f, () => {
      if (decided()) {
        const all = MODELS.map((model) => model.weights);
        shade(ctx, f, bounds, (x, y) => mix(p.surface, p.house[argmax(all.map((wt) => score(wt, [1, x, y])))], 0.55));
        all.forEach((weights, house) => line(ctx, f, p, weights, bounds, p.house[house]));
        TRAIN.forEach((student, i) => {
          const px = f.x(FEATURES(student)[0], bounds[0], bounds[1]);
          const py = f.y(FEATURES(student)[1], bounds[2], bounds[3]);
          ctx.fillStyle = p.house[student.h];
          marker(ctx, px, py, true, 4);
          if (argmax(all.map((wt) => score(wt, ROWS[i]))) !== student.h) ring(ctx, p, px, py);
        });
        return;
      }

      const weights = wAt(t);
      shade(ctx, f, bounds, (x, y) => {
        const probability = sigmoid(weights[0] + weights[1] * x + weights[2] * y);
        return probability >= 0.5
          ? mix(p.surface, p.house[HOUSE], (probability - 0.5) * 1.5)
          : mix(p.surface, p.edge, (0.5 - probability) * 1.2);
      });
      line(ctx, f, p, weights, bounds);
      TRAIN.forEach((student, i) => {
        const px = f.x(FEATURES(student)[0], bounds[0], bounds[1]);
        const py = f.y(FEATURES(student)[1], bounds[2], bounds[3]);
        ctx.fillStyle = p.house[student.h];
        marker(ctx, px, py, Y[i] === 1, 4);
        if ((score(weights, ROWS[i]) > 0 ? 1 : 0) !== Y[i]) ring(ctx, p, px, py);
      });
    });
  },

  describe(t) {
    if (decided()) {
      const all = MODELS.map((model) => model.weights);
      const wrong = TRAIN.filter((student, i) => argmax(all.map((wt) => score(wt, ROWS[i]))) !== student.h).length;
      return `Plan des notes standardisées : régions des trois maisons par le plus grand score, ${wrong} élèves cerclés sur ${N}.`;
    }
    const weights = wAt(t);
    if (weights.every((value) => Math.abs(value) < 1e-12)) {
      return `Plan des notes standardisées, modèle ${HOUSES[HOUSE]}, itération 0 : aucune droite, z = 0 en tout point.`;
    }
    return `Plan des notes standardisées, modèle ${HOUSES[HOUSE]}, itération ${t} : droite z = 0, ${errors(ROWS, Y, weights)} élèves cerclés sur ${N}.`;
  },
};
