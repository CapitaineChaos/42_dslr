// Le plan des deux notes : nuage des élèves, teinte du fond par la probabilité
// annoncée, et la droite z = 0.

import { AX, AY, COURSES, FEATURES, N, RAW, ROWS, STATS, TRAIN, Y, wAt } from '../dataset.js';
import { errors, score, sigmoid } from '../model.js';
import { clip, frame, grid, isotropic, marker, mix } from './canevas.js';

const axisLabel = (index) => STATS[COURSES[index]].label + (RAW ? ' (brute)' : '');

export const frontiere = {
  key: 'frontiere',
  label: 'Frontière',

  draw(ctx, w, h, p, t) {
    const f = frame(w, h, { l: 46, r: 12, t: 12, b: 34 });
    const weights = wAt(t);

    // En coordonnées standardisées, une distance dans le plan a un sens et
    // l'angle de la frontière doit être respecté.
    const [X0, X1, Y0, Y1] = RAW ? [AX[0], AX[1], AY[0], AY[1]] : isotropic(f, w, h, AX, AY);

    grid(ctx, p, f, X0, X1, Y0, Y1, axisLabel(0), axisLabel(1));

    clip(ctx, f, () => {
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
          const probability = sigmoid(weights[0] + weights[1] * vx + weights[2] * vy);
          ctx.fillStyle = probability >= 0.5
            ? mix(p.surface, p.houseA, (probability - 0.5) * 1.5)
            : mix(p.surface, p.houseB, (0.5 - probability) * 1.5);
          ctx.fillRect(px, py, cell, cell);
        }
      }
      ctx.globalAlpha = 1;

      if (Math.abs(weights[1]) > 1e-9 || Math.abs(weights[2]) > 1e-9) {
        ctx.strokeStyle = p.trace;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (Math.abs(weights[2]) > 1e-9) {
          const line = (x) => -(weights[0] + weights[1] * x) / weights[2];
          ctx.moveTo(f.x(X0, X0, X1), f.y(line(X0), Y0, Y1));
          ctx.lineTo(f.x(X1, X0, X1), f.y(line(X1), Y0, Y1));
        } else {
          const vertical = -weights[0] / weights[1];
          ctx.moveTo(f.x(vertical, X0, X1), f.y(Y0, Y0, Y1));
          ctx.lineTo(f.x(vertical, X0, X1), f.y(Y1, Y0, Y1));
        }
        ctx.stroke();
      }

      TRAIN.forEach((student, i) => {
        const px = f.x(FEATURES(student)[0], X0, X1);
        const py = f.y(FEATURES(student)[1], Y0, Y1);
        const wrong = (score(weights, ROWS[i]) > 0 ? 1 : 0) !== Y[i];
        ctx.fillStyle = Y[i] ? p.houseA : p.houseB;
        marker(ctx, px, py, Y[i] === 1, 4);
        if (wrong) {
          ctx.strokeStyle = p.alert;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 7.5, 0, 6.284);
          ctx.stroke();
        }
      });
    });
  },

  describe(t) {
    const weights = wAt(t);
    const scale = RAW ? 'brutes' : 'standardisées';
    if (weights.every((value) => Math.abs(value) < 1e-12)) {
      return `Plan des notes ${scale}, itération 0 : aucune droite, z = 0 en tout point.`;
    }
    return `Plan des notes ${scale}, itération ${t} : droite z = 0, ${errors(ROWS, Y, weights)} élèves cerclés sur ${N}.`;
  },
};
