// Tableau des élèves et calcul déroulé.
//
// L'étape choisit ses colonnes, sa ligne de pied et son calcul déroulé
// (content/steps.js, champ `calc`). Le calcul déroulé reprend, avec les
// nombres de l'élève sélectionné, l'opération que la colonne vient d'ajouter.
// Un clic sur un nom change d'élève.

import { STEPS } from '../content/steps.js';
import { ALPHA, COURSES, DATA, FEATURES, LAST, N, RAW, STATS, TEST, TRAIN, at, wAt } from '../dataset.js';
import { gradient, score, sigmoid, softplus } from '../model.js';
import { on, state } from '../state.js';

const host = document.getElementById('calc');

const MINUS = '−';
const num = (value, digits = 3) => `${value < 0 ? MINUS : ''}${Math.abs(value).toFixed(digits)}`;
const signed = (value, digits = 3) => `${value < 0 ? MINUS : '+'}${Math.abs(value).toFixed(digits)}`;
const paren = (value) => (value < 0 ? `(${num(value)})` : num(value));
const house = (y) => (y ? DATA.positive : DATA.negative);
const tag = (y, text = house(y)) => `<span class="house ${y ? 'a' : 'b'}">${text}</span>`;
const label = (index) => STATS[COURSES[index]].label;

function measure(student, weights) {
  const x = FEATURES(student);
  const row = [1, ...x];
  const z = score(weights, row);
  const p = sigmoid(z);
  const pred = z > 0 ? 1 : 0;
  const err = p - student.y;
  let kase = pred ? 'VP' : 'VN';
  if (pred !== student.y) kase = pred ? 'FP' : 'FN';
  return {
    student, x, row, z, p, pred, err, kase,
    loss: softplus(z) - student.y * z,
    contribution: row.map((value) => err * value),
    miss: pred !== student.y,
  };
}

const COLUMNS = {
  name: { head: () => 'élève', cell: (m, i, picked) =>
    `<button type="button" class="pick" data-pick="${i}" aria-pressed="${picked}">${m.student.name}</button>` },
  y: { head: () => 'y', cell: (m) => tag(m.student.y, m.student.y) },
  raw0: { head: () => label(0), cell: (m) => m.student.raw[0].toFixed(2) },
  raw1: { head: () => label(1), cell: (m) => m.student.raw[1].toFixed(2) },
  x1: { head: () => (RAW ? `${label(0)}` : 'x₁'), cell: (m) => signed(m.x[0]) },
  x2: { head: () => (RAW ? `${label(1)}` : 'x₂'), cell: (m) => signed(m.x[1]) },
  z: { head: () => 'z', cell: (m) => signed(m.z) },
  side: { head: () => 'réponse', cell: (m) => `${tag(m.pred)}${m.miss ? '<span class="ko">✗</span>' : ''}` },
  pred: { head: () => 'réponse', cell: (m) => tag(m.pred) },
  p: { head: () => 'p', cell: (m) => m.p.toFixed(3) },
  loss: { head: () => 'ℓ', cell: (m) => m.loss.toFixed(3) },
  err: { head: () => 'p − y', cell: (m) => `<span class="${m.err < 0 ? 'up' : 'down'}">${signed(m.err)}</span>` },
  c0: { head: () => 'pour w₀', cell: (m) => signed(m.contribution[0]) },
  c1: { head: () => 'pour w₁', cell: (m) => signed(m.contribution[1]) },
  c2: { head: () => 'pour w₂', cell: (m) => signed(m.contribution[2]) },
  case: { head: () => 'cas', cell: (m) => `<span class="case ${m.miss ? 'ko' : ''}">${m.kase}</span>` },
};

// Lignes de pied : une étiquette, puis une valeur sous chaque colonne visée.
function footer(kind, cols, rows, weights) {
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
    const grad = gradient(rows.map((m) => m.row), rows.map((m) => m.student.y), weights);
    const next = weights.map((value, col) => value - ALPHA * grad[col]);
    const at3 = (values, format = signed) => ({ c0: format(values[0]), c1: format(values[1]), c2: format(values[2]) });
    let out = line('somme', at3(sums)) + line(`∇J = somme ÷ ${N}`, at3(grad), kind === 'grad' ? 'key' : '');
    if (kind === 'update') {
      out += line(`poids actuels w`, at3(weights));
      out += line(`− α∇J  (α = ${ALPHA})`, at3(grad.map((value) => -ALPHA * value)));
      out += line('nouveaux poids', at3(next), 'key');
    }
    return out;
  }

  if (kind === 'confusion') {
    const counts = { VP: 0, FN: 0, FP: 0, VN: 0 };
    rows.forEach((m) => { counts[m.kase] += 1; });
    const text = Object.entries(counts).map(([key, value]) => `${key} ${value}`).join(' · ');
    return `<tr class="key"><th scope="row" colspan="${cols.length}">${text}</th></tr>`;
  }
  return '';
}

// Le calcul déroulé : l'opération de l'étape, écrite avec les nombres de l'élève.
const WORKED = {
  scale: (m) => [0, 1].map((col) => {
    const stat = STATS[COURSES[col]];
    return `x${col ? '₂' : '₁'} = (${label(col)} − μ) / σ = (${m.student.raw[col].toFixed(2)} − ${stat.mu.toFixed(2)}) / ${stat.sd.toFixed(2)} = <b>${signed(m.x[col])}</b>`;
  }),
  z: (m, w) => [
    'z = w₀ + w₁·x₁ + w₂·x₂',
    `z = ${num(w[0])} + ${paren(w[1])} × ${paren(m.x[0])} + ${paren(w[2])} × ${paren(m.x[1])}`,
    `z = <b>${signed(m.z)}</b>`,
  ],
  side: (m) => [
    `z = ${signed(m.z)} ${m.z > 0 ? '&gt; 0' : '≤ 0'} → réponse ${tag(m.pred)}`,
    `vraie maison ${tag(m.student.y)} → ${m.miss ? '<span class="ko">erreur</span>' : 'correct'}`,
  ],
  p: (m) => [
    'p = σ(z) = 1 / (1 + e<sup>−z</sup>)',
    `p = 1 / (1 + e<sup>${m.z > 0 ? MINUS : '+'}${Math.abs(m.z).toFixed(3)}</sup>) = <b>${m.p.toFixed(3)}</b>`,
  ],
  loss: (m) => (m.student.y
    ? [`y = 1 (${house(1)}) : ℓ = −ln(p)`, `ℓ = −ln(${m.p.toFixed(3)}) = <b>${m.loss.toFixed(3)}</b>`]
    : [`y = 0 (${house(0)}) : ℓ = −ln(1 − p)`, `ℓ = −ln(1 − ${m.p.toFixed(3)}) = −ln(${(1 - m.p).toFixed(3)}) = <b>${m.loss.toFixed(3)}</b>`]),
  J: (m, w, rows) => {
    const total = rows.reduce((sum, row) => sum + row.loss, 0);
    return [`J = (ℓ₁ + ℓ₂ + … + ℓ${String(N).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')}) / ${N}`,
      `J = ${num(total)} / ${N} = <b>${num(total / N, 4)}</b>`];
  },
  err: (m) => [
    `p − y = ${m.p.toFixed(3)} − ${m.student.y} = <b>${signed(m.err)}</b>`,
    m.err < 0 ? `négatif : le score de ${m.student.name} doit monter` : `positif : le score de ${m.student.name} doit baisser`,
  ],
  contrib: (m) => [
    '(p − y) × (1, x₁, x₂)',
    `${paren(m.err)} × (1, ${num(m.x[0])}, ${num(m.x[1])})`,
    `= (<b>${signed(m.contribution[0])}</b>, <b>${signed(m.contribution[1])}</b>, <b>${signed(m.contribution[2])}</b>)`,
  ],
  update: (m, w, rows) => {
    const grad = gradient(rows.map((row) => row.row), rows.map((row) => row.student.y), w);
    return w.map((value, col) => {
      const sub = '₀₁₂'[col];
      return `w${sub} ← w${sub} − α·∇J${sub} = ${num(value)} − ${ALPHA} × ${paren(grad[col])} = <b>${signed(value - ALPHA * grad[col])}</b>`;
    });
  },
  // Le code compare la perte du tour à celle du tour précédent, avant de
  // mettre les poids à jour : à l'itération 0 il n'y a rien à comparer.
  stop: () => {
    if (state.t === 0) return ['itération 0 : pas de J précédent → <b>on continue</b>'];
    const before = at(state.t - 1).cost;
    const now = at(state.t).cost;
    const change = Math.abs(before - now) / Math.max(1, Math.abs(now));
    const done = state.t >= LAST;
    return [
      '|J(t−1) − J(t)| / max(1, |J(t)|)',
      `= |${before.toFixed(8)} − ${now.toFixed(8)}| / ${Math.max(1, Math.abs(now)).toFixed(0)}`,
      `= ${change.toExponential(2)} ${done ? '&lt; 10⁻⁶ → <b>arrêt</b>' : '≥ 10⁻⁶ → <b>on continue</b>'}`,
    ];
  },
  case: (m) => [
    `p = ${m.p.toFixed(3)} ${m.p > 0.5 ? '&gt; 0.5' : '≤ 0.5'} → réponse ${tag(m.pred)}`,
    `vraie maison ${tag(m.student.y)} → <b class="${m.miss ? 'ko' : ''}">${m.kase}</b>`,
  ],
};

const STUDENT_FREE = ['J', 'update', 'stop'];

function render() {
  const spec = STEPS[state.step].calc;
  if (!spec) { host.innerHTML = ''; return; }

  const weights = wAt(state.t);
  const group = spec.group === 'test' ? TEST : TRAIN;
  const rows = group.map((student) => measure(student, weights));
  const trainRows = spec.group === 'test' ? TRAIN.map((student) => measure(student, weights)) : rows;
  const key = spec.group === 'test' ? 'pickTest' : 'pick';
  const index = Math.min(state[key], group.length - 1);
  const picked = rows[index];

  let worked = '';
  if (spec.worked && WORKED[spec.worked]) {
    const free = STUDENT_FREE.includes(spec.worked);
    const lines = WORKED[spec.worked](picked, weights, trainRows);
    worked = `<div class="worked">
      <p class="worked-head">${free ? 'calcul' : `calcul pour <b>${picked.student.name}</b>`}</p>
      ${lines.map((text) => `<p class="worked-line">${text}</p>`).join('')}
    </div>`;
  }

  let table = '';
  if (spec.cols) {
    const cols = spec.cols;
    const judged = STEPS[state.step].phase !== 'amont';
    const head = cols.map((col) => `<th scope="col">${COLUMNS[col].head()}</th>`).join('');
    const body = rows.map((m, i) => {
      const cells = cols.map((col) => `<td class="col-${col}">${COLUMNS[col].cell(m, i, i === index)}</td>`).join('');
      return `<tr class="${m.miss && judged ? 'miss' : ''} ${i === index ? 'picked' : ''}">${cells}</tr>`;
    }).join('');
    const foot = spec.footer ? `<tfoot>${footer(spec.footer, cols, rows, weights)}</tfoot>` : '';
    const caption = spec.group === 'test'
      ? `évaluation · ${group.length} élèves`
      : `apprentissage · ${group.length} élèves`;
    table = `<div class="table-wrap">
      <p class="table-legend">${tag(1, `y = 1 ${house(1)}`)} ${tag(0, `y = 0 ${house(0)}`)}</p>
      <table class="students">
      <caption>${caption}</caption>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
      ${foot}
    </table></div>`;
  }

  host.innerHTML = worked + table;
}

export function mount() {
  host.addEventListener('click', (event) => {
    const button = event.target.closest('[data-pick]');
    if (!button) return;
    const key = STEPS[state.step].calc.group === 'test' ? 'pickTest' : 'pick';
    state[key] = parseInt(button.dataset.pick, 10);
    render();
  });
  on('step', render);
  on('iteration', render);
  render();
}
