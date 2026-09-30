// Tableau des élèves et calcul déroulé.
//
// L'étape choisit ses colonnes, sa ligne de pied, sa matrice et son calcul
// déroulé (champ `calc` de l'étape). Quand l'étape calcule une grandeur sur
// tous les élèves (gradient, μ et σ, coût…), ce calcul passe en premier. Le
// calcul d'un élève reprend ensuite, avec ses nombres, l'opération que la
// colonne vient d'ajouter. Un clic sur un nom change d'élève.
//
// calc/measure.js lit chaque élève, calc/columns.js en tire les cellules,
// calc/footer.js les lignes de pied, calc/matrix.js la matrice de confusion,
// calc/worked.js le calcul déroulé.

import { config } from '../config.js';
import { STEPS } from '../content/steps.js';
import { CV_MATRIX, FITTED, HELD, HOUSES, LEARN, TEST, TRAIN, wAt } from '../dataset.js';
import { matrixOf } from '../model.js';
import { on, state } from '../state.js';
import { COLUMNS, view } from './calc/columns.js';
import { footer } from './calc/footer.js';
import { tag } from './calc/format.js';
import { matrix } from './calc/matrix.js';
import { measure } from './calc/measure.js';
import { FREE, WORKED } from './calc/worked.js';
import { reserve } from './steady.js';

const host = document.getElementById('calc');

const CAPTIONS = {
  test: 'élèves réservés',
  all: 'tous les élèves',
  held: 'élèves du pli',
  learn: 'élèves d\'apprentissage',
};

const FOLD_COLUMNS = ['fold', 'cvpred'];

function workedBlock(spec, picked, weights, rows, t) {
  const kinds = [].concat(spec.worked || []).filter((kind) => WORKED[kind]);
  return kinds.map((kind) => {
    const global = FREE.includes(kind);
    const lines = WORKED[kind](picked, weights, rows, t);
    return `<div class="worked ${!global && kinds.length > 1 ? 'is-detail' : ''}">
      <p class="worked-head">${global ? `calcul sur ${rows.length} élèves` : `calcul pour <b>${picked.student.name}</b>`}</p>
      ${lines.map((text) => `<p class="worked-line">${text}</p>`).join('')}
    </div>`;
  }).join('');
}

function tableBlock(spec, rows, index, weights) {
  if (!spec.cols) return '';
  const cols = spec.cols.filter((col) => config.cv || !FOLD_COLUMNS.includes(col));
  const phase = STEPS[state.step].phase;
  const judged = !['intro', 'amont', 'prep', 'maison'].includes(phase);
  const decided = ['post', 'valid', 'aval'].includes(phase);
  const head = cols.map((col) => `<th scope="col" class="col-${col}">${COLUMNS[col].head()}</th>`).join('');
  const body = rows.map((m, i) => {
    const cells = cols.map((col) => `<td class="col-${col}">${COLUMNS[col].cell(m, i, i === index)}</td>`).join('');
    let miss = judged && (decided ? m.wrong : m.miss);
    if (spec.footer === 'folds') miss = m.cv.miss;
    return `<tr class="${miss ? 'miss' : ''} ${i === index ? 'picked' : ''}">${cells}</tr>`;
  }).join('');
  const foot = spec.footer ? `<tfoot>${footer(spec.footer, cols, rows, weights)}</tfoot>` : '';
  const caption = spec.group === 'held' ? `élèves du pli ${state.pli + 1}` : (CAPTIONS[spec.group] || 'élèves d\'entraînement');
  return `<div class="table-wrap">
    <p class="table-legend">${HOUSES.map((name, h) => tag(h, name)).join(' ')}</p>
    <table class="students">
    <caption>${caption} · ${rows.length}</caption>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
    ${foot}
  </table></div>`;
}

function render(t) {
  const spec = STEPS[state.step].calc;
  if (!spec) { host.innerHTML = ''; return; }
  if (spec.matrix === 'cv') {
    host.innerHTML = matrix(CV_MATRIX, `décisions hors pli · ${LEARN.length} élèves`);
    return;
  }

  const weights = wAt(t);
  view.holes = Boolean(spec.holes);
  const group = { test: TEST, all: LEARN.concat(TEST), held: HELD, learn: LEARN }[spec.group] || TRAIN;
  if (!group.length) { host.innerHTML = ''; return; }
  const rows = group.map((student) => measure(student, weights));
  const trainRows = spec.group === 'test' ? TRAIN.map((student) => measure(student, weights)) : rows;
  const index = Math.min(state[spec.group === 'test' ? 'pickTest' : 'pick'], group.length - 1);

  const block = spec.matrix === 'train'
    ? matrix(matrixOf(FITTED.map((result) => [result.student.h, result.pred]), HOUSES.length), `élèves d'entraînement · ${FITTED.length}`)
    : '';

  host.innerHTML = workedBlock(spec, rows[index], weights, trainRows, t) + block + tableBlock(spec, rows, index, weights);
}

// La hauteur est réservée pour toute la descente, de sorte que le tableau et
// le calcul déroulé ne bougent pas quand l'itération change (views/steady.js).
function fit() {
  reserve(host, render, state.t);
}

export function mount() {
  host.addEventListener('click', (event) => {
    const button = event.target.closest('[data-pick]');
    if (!button) return;
    const key = STEPS[state.step].calc.group === 'test' ? 'pickTest' : 'pick';
    state[key] = parseInt(button.dataset.pick, 10);
    fit();
  });
  on('step', fit);
  on('model', fit);
  on('iteration', () => render(state.t));
  fit();

  let width = host.clientWidth;
  new ResizeObserver(() => {
    if (host.clientWidth === width) return;
    width = host.clientWidth;
    fit();
  }).observe(host);
}
