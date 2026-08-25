// La fonction logistique dans le plan (z, p), et les scores des élèves portés
// à l'ordonnée de leur étiquette.

import { N, ROWS, Y, wAt } from '../dataset.js';
import { score, sigmoid } from '../model.js';
import { clip, frame, grid, marker } from './canevas.js';

// L'axe des scores garde 6 unités de part et d'autre tant que la descente n'a
// pas produit de plus grands scores : σ y atteint 0,9975, la saturation est
// visible dès le premier écran.
function span(weights) {
  const largest = Math.max(...ROWS.map((row) => Math.abs(score(weights, row))));
  return Math.max(6, largest * 1.15);
}

export const sigmoide = {
  key: 'sigmoide',
  label: 'Sigmoïde',

  draw(ctx, w, h, p, t) {
    const f = frame(w, h, { l: 46, r: 12, t: 12, b: 34 });
    const weights = wAt(t);
    const limit = span(weights);
    grid(ctx, p, f, -limit, limit, -0.08, 1.08, 'z', 'p');

    clip(ctx, f, () => {
      ctx.strokeStyle = p.grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(f.pad.l, f.y(0.5, -0.08, 1.08));
      ctx.lineTo(f.w - f.pad.r, f.y(0.5, -0.08, 1.08));
      ctx.moveTo(f.x(0, -limit, limit), f.pad.t);
      ctx.lineTo(f.x(0, -limit, limit), f.h - f.pad.b);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = p.trace;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 120; i += 1) {
        const z = -limit + (2 * limit * i) / 120;
        const px = f.x(z, -limit, limit);
        const py = f.y(sigmoid(z), -0.08, 1.08);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ROWS.forEach((row, i) => {
        const z = score(weights, row);
        const px = f.x(z, -limit, limit);
        const py = f.y(Y[i], -0.08, 1.08);
        ctx.fillStyle = Y[i] ? p.houseA : p.houseB;
        marker(ctx, px, py, Y[i] === 1, 4);
        if ((z > 0 ? 1 : 0) !== Y[i]) {
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
    const scores = ROWS.map((row) => score(weights, row));
    return `Fonction logistique dans le plan (z, p) à l'itération ${t}. Les ${N} élèves sont portés à l'ordonnée de leur étiquette, en abscisse de leur score, de ${Math.min(...scores).toFixed(2)} à ${Math.max(...scores).toFixed(2)} ; la verticale marque z = 0.`;
  },
};
