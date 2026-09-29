// Colonnes du tableau des élèves : un en-tête, avec sa définition au survol, et
// une cellule par élève mesuré (measure.js).

import { NOTES, tip } from '../../content/symbols.js';
import { FOLD_OF, HOUSE, HOUSES, VALUE } from '../../dataset.js';
import { label, signed, tag, zh } from './format.js';

// Étape Données : les notes absentes s'affichent en tiret. Aux étapes
// suivantes, la valeur imputée est signalée.
export const view = { holes: false };

function note(m, col) {
  if (!m.student.imputed[col]) return m.student.raw[col].toFixed(2);
  if (view.holes) return '<span class="hole">—</span>';
  const value = VALUE(m.student, col).toFixed(2);
  return `<span class="imputed">${tip(value, 'Note absente, remplacée par la médiane de la matière dans ce passage.', true)}</span>`;
}

// Le plus grand des trois scores est en gras.
const scoreCell = (h) => (m) => (m.decision.pred === h ? `<b>${signed(m.decision.z[h])}</b>` : signed(m.decision.z[h]));
const cross = (wrong) => (wrong ? '<span class="ko">✗</span>' : '');

export const COLUMNS = {
  name: { head: () => 'élève', cell: (m, i, picked) =>
    `<button type="button" class="pick" data-pick="${i}" aria-pressed="${picked}">${m.student.name}</button>` },
  house: { head: () => tip('maison', NOTES.house, true), cell: (m) => tag(m.student.h) },
  y: { head: () => tip('y', NOTES.y, true), cell: (m) => (m.y ? tag(HOUSE, '1') : '0') },
  group: { head: () => tip('groupe', NOTES.group, true), cell: (m) => (m.student.usage === 'apprentissage' ? 'apprentissage' : 'réservé') },
  raw0: { head: () => tip(label(0), NOTES.raw, true), cell: (m) => note(m, 0) },
  raw1: { head: () => tip(label(1), NOTES.raw, true), cell: (m) => note(m, 1) },
  x1: { head: () => tip('x₁', NOTES.x1, true), cell: (m) => signed(m.x[0]) },
  x2: { head: () => tip('x₂', NOTES.x2, true), cell: (m) => signed(m.x[1]) },
  z: { head: () => tip('z', NOTES.z, true), cell: (m) => signed(m.z) },
  z0: { head: () => tip(zh(0), NOTES.zh[0], true), cell: scoreCell(0) },
  z1: { head: () => tip(zh(1), NOTES.zh[1], true), cell: scoreCell(1) },
  z2: { head: () => tip(zh(2), NOTES.zh[2], true), cell: scoreCell(2) },
  side: { head: () => tip('côté', `z &gt; 0 → ${HOUSES[HOUSE]}, sinon autres maisons`, true),
    cell: (m) => `${m.pred ? tag(HOUSE) : 'autres'}${cross(m.miss)}` },
  hmax: { head: () => tip('réponse', NOTES.hmax, true), cell: (m) => `${tag(m.decision.pred)}${cross(m.wrong)}` },
  p: { head: () => tip('p', NOTES.p, true), cell: (m) => m.p.toFixed(3) },
  loss: { head: () => tip('ℓ', NOTES.loss, true), cell: (m) => m.loss.toFixed(3) },
  err: { head: () => tip('p − y', NOTES.err, true), cell: (m) => `<span class="${m.err < 0 ? 'up' : 'down'}">${signed(m.err)}</span>` },
  c0: { head: () => tip('pour w₀', NOTES.c0, true), cell: (m) => signed(m.contribution[0]) },
  c1: { head: () => tip('pour w₁', NOTES.c1, true), cell: (m) => signed(m.contribution[1]) },
  c2: { head: () => tip('pour w₂', NOTES.c2, true), cell: (m) => signed(m.contribution[2]) },
  case: { head: () => tip('cas', NOTES.case, true), cell: (m) => `<span class="case ${m.miss ? 'ko' : ''}">${m.kase}</span>` },
  fold: { head: () => tip('pli', NOTES.fold, true), cell: (m) => (FOLD_OF.has(m.student.id) ? FOLD_OF.get(m.student.id) + 1 : '—') },
  cvpred: { head: () => tip('réponse hors pli', NOTES.cvpred, true), cell: (m) => `${tag(m.cv.pred)}${cross(m.cv.miss)}` },
};
