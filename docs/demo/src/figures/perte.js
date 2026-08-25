// J en fonction de l'itération, avec le point de l'itération courante.

import { ALPHA, LAST, TRACE, at } from '../dataset.js';
import { clip, frame, grid } from './canevas.js';

// La fenêtre suit l'itération courante au lieu d'étaler d'emblée les 528 pas :
// les premières itérations, où tout se joue, resteraient collées à l'axe.
const spanFor = (t) => Math.max(20, Math.min(LAST, Math.max(t * 2, 40)));

export const perte = {
  key: 'perte',
  label: 'Perte',

  draw(ctx, w, h, p, t) {
    const f = frame(w, h, { l: 52, r: 12, t: 12, b: 34 });
    const span = spanFor(t);
    const high = TRACE[0].cost;
    const low = TRACE[LAST].cost;
    const top = high + (high - low) * 0.08;
    const bottom = Math.max(0, low - (high - low) * 0.12);
    grid(ctx, p, f, 0, span, bottom, top, 'itération', 'perte J');

    clip(ctx, f, () => {
      ctx.strokeStyle = p.trace;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= Math.min(span, LAST); i += 1) {
        const px = f.x(i, 0, span);
        const py = f.y(TRACE[i].cost, bottom, top);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const px = f.x(Math.min(t, span), 0, span);
      const py = f.y(at(t).cost, bottom, top);
      ctx.strokeStyle = p.inkFaint;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px, f.pad.t);
      ctx.lineTo(px, f.h - f.pad.b);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = p.trace;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, 6.284);
      ctx.fill();
    });
  },

  describe(t) {
    return `Perte J des ${Math.min(spanFor(t), LAST)} premières itérations, point à l'itération ${t} où J vaut ${at(t).cost.toFixed(6)}.`;
  },
};
