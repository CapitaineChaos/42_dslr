// Matrice de confusion, une ligne par maison réelle et une colonne par maison
// attribuée, puis les scores de chaque maison. Une case d'erreur non vide est
// cerclée.

import { NOTES, tip } from '../../content/symbols.js';
import { HOUSES } from '../../dataset.js';
import { report } from '../../model.js';
import { pct, tag } from './format.js';

export function matrix(counts, caption) {
  const scores = report(counts);
  const cell = (count, hit) => `<td class="${hit || !count ? '' : 'err'}"><span class="count">${count}</span></td>`;
  const head = HOUSES.map((_, h) => `<th scope="col">${tag(h)}</th>`).join('');
  const body = counts.map((row, real) => `<tr><th scope="row">${tag(real)}</th>${row.map((count, predicted) =>
    cell(count, real === predicted)).join('')}</tr>`).join('');
  const lines = scores.houses.map((house, h) => `<tr><td>${tag(h)}</td><td>${pct(house.precision)}</td>
    <td>${pct(house.recall)}</td><td>${pct(house.f1)}</td><td>${house.total}</td></tr>`).join('');
  return `<div class="matrix-wrap">
    <table class="matrix">
      <caption>${caption}</caption>
      <thead><tr><td class="corner">réelle ╲ attribuée</td>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
    <table class="students scores">
      <thead><tr><th scope="col">maison</th><th scope="col">${tip('précision', NOTES.precision, true)}</th>
        <th scope="col">${tip('rappel', NOTES.recall, true)}</th><th scope="col">${tip('F1', NOTES.f1, true)}</th>
        <th scope="col">élèves</th></tr></thead>
      <tbody>${lines}</tbody>
      <tfoot><tr class="key"><th scope="row" colspan="4">exactitude</th><td>${pct(scores.accuracy)}</td></tr></tfoot>
    </table>
  </div>`;
}
