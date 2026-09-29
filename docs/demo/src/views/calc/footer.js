// Lignes de pied du tableau : J, gradient et correction des poids, bilan des
// plis. Une étiquette, puis une valeur sous chaque colonne visée.

import { ALPHA, K, LEARN, N, PLIS } from '../../dataset.js';
import { gradient } from '../../model.js';
import { initial, num, signed } from './format.js';

export function footer(kind, cols, rows, weights) {
  const span = (key) => cols.indexOf(key);
  const line = (text, values, cls = '') => {
    const first = Math.min(...Object.keys(values).map(span));
    const cells = cols.slice(first).map((key) => `<td>${values[key] ?? ''}</td>`).join('');
    return `<tr class="${cls}"><th scope="row" colspan="${first}">${text}</th>${cells}</tr>`;
  };

  if (kind === 'J') {
    const total = rows.reduce((sum, m) => sum + m.loss, 0);
    return line('somme des ℓ', { loss: num(total) }) + line(`J = somme ÷ ${N}`, { loss: num(total / N) }, 'key');
  }

  if (kind === 'grad' || kind === 'update') {
    const sums = [0, 1, 2].map((col) => rows.reduce((sum, m) => sum + m.contribution[col], 0));
    const grad = gradient(rows.map((m) => m.row), rows.map((m) => m.y), weights);
    const next = weights.map((value, col) => value - ALPHA * grad[col]);
    const at3 = (values) => ({ c0: signed(values[0]), c1: signed(values[1]), c2: signed(values[2]) });
    let out = line('somme', at3(sums)) + line(`∇J = somme ÷ ${N}`, at3(grad), kind === 'grad' ? 'key' : '');
    if (kind === 'update') {
      out += line('poids actuels w', at3(weights));
      out += line(`− α∇J  (α = ${ALPHA})`, at3(grad.map((value) => -ALPHA * value)));
      out += line('nouveaux poids', at3(next), 'key');
    }
    return out;
  }

  if (kind === 'folds') {
    const lines = PLIS.slice(0, K).map((pass) => {
      const stops = pass.models.map((model, h) => `${initial(h)} ${model.last}${model.converged ? '' : ' (limite)'}`).join(', ');
      return `<tr><th scope="row" class="wrap" colspan="${cols.length}">pli ${pass.pli + 1} : ${pass.correct} sur
        ${pass.held.length} bien classés · modèles entraînés sur ${pass.train.length} élèves, arrêts ${stops}</th></tr>`;
    }).join('');
    const correct = PLIS.slice(0, K).reduce((sum, pass) => sum + pass.correct, 0);
    return `${lines}<tr class="key"><th scope="row" class="wrap" colspan="${cols.length}">exactitude hors pli :
      ${correct} sur ${LEARN.length}, soit ${((correct / LEARN.length) * 100).toFixed(1)} %</th></tr>`;
  }

  return '';
}
