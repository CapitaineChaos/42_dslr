// Paramètres fixes de la descente, compteur d'itération avec l'arrêt et sa
// cause, et les trois mesures du modèle affiché. Les largeurs sont fixées, en
// caractères, d'après la plus longue des descentes, de sorte que changer de
// modèle ou d'itération ne décale rien.

import { NOTES, tip } from '../../content/symbols.js';
import { ALPHA, CONVERGED, LAST, LEARN, MAX_ITER, N, PLIS, ROWS, Y, at, wAt } from '../../dataset.js';
import { confusion } from '../../model.js';
import { state } from '../../state.js';

const output = document.getElementById('iteration');
const maximum = document.getElementById('iteration-max');
const kind = document.getElementById('stop-kind');
const params = document.getElementById('params');
const readout = document.getElementById('readout');

const ITER = Math.max(...PLIS.flatMap((pass) => pass.models.map((model) => String(model.last).length)));
const COST = 6;
const WRONG = 2 * String(LEARN.length).length + 1;

const pad = (text, width) => String(text).padStart(width);

export function paintParams() {
  params.innerHTML = [
    [tip('α', NOTES.alpha, true), ALPHA],
    [tip('ε', NOTES.epsilon, true), '10⁻³'],
    [tip('limite', NOTES.limit, true), MAX_ITER],
    [tip('n', NOTES.n, true), pad(N, 2)],
  ].map(([term, value]) => `<div><dt>${term}</dt><dd class="param">${value}</dd></div>`).join('');
}

export function paint() {
  const matrix = confusion(ROWS, Y, wAt(state.t));
  const wrong = matrix.fp + matrix.fn;

  output.textContent = pad(state.t, ITER);
  maximum.textContent = pad(LAST, ITER);
  kind.textContent = CONVERGED ? 'critère' : 'limite';
  kind.classList.toggle('warn', !CONVERGED);

  readout.innerHTML = [
    ['perte J', pad(at(state.t).cost.toFixed(4), COST), ''],
    ['erreurs', pad(`${wrong}/${N}`, WRONG), wrong ? 'warn' : ''],
    ['exactitude', pad(`${(matrix.accuracy * 100).toFixed(1)} %`, 7), ''],
  ].map(([term, value, cls]) =>
    `<div><dt>${term}</dt><dd class="${cls}">${value}</dd></div>`).join('');
}
