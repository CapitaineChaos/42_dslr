// Liste des élèves, les deux groupes l'un sous l'autre, dans l'ordre du fichier.
//
// Chaque ligne porte l'étiquette observée, le score, la probabilité estimée et
// la case de la matrice de confusion où elle tombe.

import { DATA, FEATURES, N, TEST, TRAIN, wAt } from '../dataset.js';
import { score, sigmoid } from '../model.js';
import { on, state } from '../state.js';

const host = document.getElementById('roster');
const count = document.getElementById('roster-count');
const legend = document.getElementById('roster-legend');

const CASES = [['VN', 'FN'], ['FP', 'VP']];

const cellFor = (student, weights) =>
  CASES[score(weights, [1, ...FEATURES(student)]) > 0 ? 1 : 0][student.y];

function table(group, caption, weights) {
  const body = group.map((student) => {
    const z = score(weights, [1, ...FEATURES(student)]);
    const cell = cellFor(student, weights);
    const miss = cell === 'FP' || cell === 'FN';
    return `<tr class="${miss ? 'miss' : ''}">
      <td>${student.name}</td>
      <td class="label ${student.y ? 'a' : 'b'}">${student.y}</td>
      <td>${z >= 0 ? '+' : ''}${z.toFixed(2)}</td>
      <td>${sigmoid(z).toFixed(3)}</td>
      <td class="case ${miss ? 'ko' : ''}">${cell}</td>
    </tr>`;
  }).join('');

  return `<table>
    <caption>${caption}</caption>
    <thead><tr><th>élève</th><th>y</th><th>z</th><th>p</th><th class="case">cas</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

function update() {
  const weights = wAt(state.t);
  const wrong = TRAIN.filter((student) => ['FP', 'FN'].includes(cellFor(student, weights))).length;

  host.innerHTML = table(TRAIN, `apprentissage (${N})`, weights)
    + table(TEST, `évaluation (${TEST.length})`, weights);

  count.textContent = `erreurs ${String(wrong).padStart(String(N).length)}/${N}`;
  count.classList.toggle('some', wrong > 0);
}

export function mount() {
  legend.innerHTML = `<span class="a">y = 1 ${DATA.positive}</span> <span class="b">y = 0 ${DATA.negative}</span>`;
  on('iteration', update);
  update();
}
