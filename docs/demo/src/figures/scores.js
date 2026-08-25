// z, sur une droite graduée.
//
// La combinaison linéaire réduit les deux notes à ce seul nombre. La figure le
// montre tel quel : une droite, les élèves posés à leur score, et la graduation
// 0 où le signe bascule. σ n'intervient qu'ensuite.

import { N, ROWS, Y, wAt } from '../dataset.js';
import { score } from '../model.js';
import { niceStep, tick } from './canevas.js';

export const scores = {
  key: 'scores',
  label: 'z',

  draw(ctx, w, h, p, t) {
    const weights = wAt(t);
    const values = ROWS.map((row) => score(weights, row));
    const limit = Math.max(1, Math.max(...values.map(Math.abs)) * 1.15);

    const left = 16;
    const right = w - 16;
    const axis = Math.round(h / 2) + 0.5;
    const at = (value) => left + ((value + limit) / (2 * limit)) * (right - left);

    ctx.save();
    ctx.font = p.label;

    ctx.strokeStyle = p.inkFaint;
    ctx.fillStyle = p.inkFaint;
    ctx.lineWidth = 1;
    ctx.textAlign = 'center';
    const step = niceStep(-limit, limit);
    for (let value = Math.ceil(-limit / step) * step; value <= limit + 1e-9; value += step) {
      const px = Math.round(at(value)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, axis);
      ctx.lineTo(px, axis + 6);
      ctx.stroke();
      ctx.fillText(tick(value), px, axis + 20);
    }

    ctx.strokeStyle = p.trace;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, axis);
    ctx.lineTo(right, axis);
    ctx.stroke();

    // La graduation 0 porte la décision : elle traverse la droite.
    const zero = Math.round(at(0)) + 0.5;
    ctx.beginPath();
    ctx.moveTo(zero, axis - 16);
    ctx.lineTo(zero, axis + 12);
    ctx.stroke();

    // Liseré au fond de la carte : sur une droite unique, les élèves de la zone
    // de recouvrement se touchent, et sans lui la grappe formerait une tache.
    values.forEach((value, i) => {
      const px = at(value);
      const size = 4.5;
      ctx.beginPath();
      if (Y[i]) ctx.rect(px - size, axis - size, size * 2, size * 2);
      else ctx.arc(px, axis, size, 0, 6.284);
      ctx.fillStyle = Y[i] ? p.houseA : p.houseB;
      ctx.fill();
      ctx.strokeStyle = p.surface;
      ctx.lineWidth = 1;
      ctx.stroke();
      if ((value > 0 ? 1 : 0) !== Y[i]) {
        ctx.strokeStyle = p.alert;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, axis, 8.5, 0, 6.284);
        ctx.stroke();
      }
    });

    ctx.restore();
  },

  describe(t) {
    const values = ROWS.map((row) => score(wAt(t), row));
    if (values.every((value) => Math.abs(value) < 1e-12)) {
      return `Scores des ${N} élèves à l'itération 0 : tous nuls, confondus sur la graduation 0.`;
    }
    return `Scores des ${N} élèves à l'itération ${t}, de ${Math.min(...values).toFixed(2)} à ${Math.max(...values).toFixed(2)} sur une droite graduée. La graduation 0 sépare les deux décisions ; les élèves du mauvais côté sont cerclés.`;
  },
};
