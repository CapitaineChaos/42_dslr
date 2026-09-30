// Le calcul déroulé : l'opération de l'étape, écrite avec les nombres de
// l'élève sélectionné. Les calculs de FREE ne dépendent d'aucun élève.

import { ALPHA, CONVERGED, COURSES, HOUSE, K, LAST, N, PLIS, STATS, TRAIN, VALUE } from '../../dataset.js';
import { gradient } from '../../model.js';
import { MINUS, label, num, paren, signed, tag, zh } from './format.js';

export const FREE = ['J', 'update', 'stop', 'impute'];

export const WORKED = {
  impute: () => {
    const lines = TRAIN.flatMap((student) => student.imputed.map((absent, col) => {
      if (!absent) return null;
      const present = STATS[COURSES[col]].present;
      return `${student.name}, ${label(col)} : note absente → médiane des ${present} notes présentes = <b>${VALUE(student, col).toFixed(4)}</b>`;
    }).filter(Boolean));
    return lines.length ? lines : ['aucune note absente parmi les élèves d\'entraînement de ce passage'];
  },
  labels: (m) => [
    `dans le modèle de ${tag(HOUSE)}, y = 1 pour ses élèves et 0 pour les autres`,
    `${m.student.name} est de ${tag(m.student.h)} → <b>y = ${m.y}</b>`,
  ],
  fold: (m) => [
    `${m.student.name} appartient au pli ${m.cv.fold + 1} sur ${K}`,
    `modèles entraînés sans ce pli, sur ${PLIS[m.cv.fold].train.length} élèves`,
    `${m.cv.z.map((value, h) => `${zh(h)} = ${signed(value)}`).join(', ')} → réponse ${tag(m.cv.pred)}`,
    `maison réelle ${tag(m.student.h)} → <b class="${m.cv.miss ? 'ko' : ''}">${m.cv.miss ? 'erreur' : 'correct'}</b>`,
  ],
  scale: (m) => [0, 1].map((col) => {
    const stat = STATS[COURSES[col]];
    return `x${col ? '₂' : '₁'} = (${label(col)} − μ) / σ = (${VALUE(m.student, col).toFixed(2)} − ${stat.mu.toFixed(2)}) / ${stat.sd.toFixed(2)} = <b>${signed(m.x[col])}</b>`;
  }),
  z: (m, w) => [
    'z = w₀ + w₁·x₁ + w₂·x₂',
    `z = ${num(w[0])} + ${paren(w[1])} × ${paren(m.x[0])} + ${paren(w[2])} × ${paren(m.x[1])}`,
    `z = <b>${signed(m.z)}</b>`,
  ],
  side: (m) => [
    `z = ${signed(m.z)} ${m.z > 0 ? '&gt; 0' : '≤ 0'} → côté ${m.pred ? tag(HOUSE) : 'autres maisons'}`,
    `étiquette y = ${m.y} → ${m.miss ? '<span class="ko">mal placé</span>' : 'bien placé'}`,
  ],
  p: (m) => [
    'p = σ(z) = 1 / (1 + e<sup>−z</sup>)',
    `p = 1 / (1 + e<sup>${m.z > 0 ? MINUS : '+'}${Math.abs(m.z).toFixed(3)}</sup>) = <b>${m.p.toFixed(3)}</b>`,
  ],
  loss: (m) => (m.y
    ? ['y = 1, donc ℓ = −ln(p)', `ℓ = −ln(${m.p.toFixed(3)}) = <b>${m.loss.toFixed(3)}</b>`]
    : ['y = 0, donc ℓ = −ln(1 − p)', `ℓ = −ln(1 − ${m.p.toFixed(3)}) = −ln(${(1 - m.p).toFixed(3)}) = <b>${m.loss.toFixed(3)}</b>`]),
  J: (m, w, rows) => {
    const total = rows.reduce((sum, row) => sum + row.loss, 0);
    return [`J = (ℓ₁ + ℓ₂ + … + ℓ${String(N).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d]).join('')}) / ${N}`,
      `J = ${num(total)} / ${N} = <b>${num(total / N, 4)}</b>`];
  },
  err: (m) => [
    `p − y = ${m.p.toFixed(3)} − ${m.y} = <b>${signed(m.err)}</b>`,
    m.err < 0 ? 'p − y &lt; 0, donc augmenter z réduit ℓ' : 'p − y &gt; 0, donc diminuer z réduit ℓ',
  ],
  contrib: (m) => [
    '(p − y) × (1, x₁, x₂)',
    `${paren(m.err)} × (1, ${num(m.x[0])}, ${num(m.x[1])})`,
    `= (<b>${signed(m.contribution[0])}</b>, <b>${signed(m.contribution[1])}</b>, <b>${signed(m.contribution[2])}</b>)`,
  ],
  update: (m, w, rows) => {
    const grad = gradient(rows.map((row) => row.row), rows.map((row) => row.y), w);
    return w.map((value, col) => {
      const sub = '₀₁₂'[col];
      return `w${sub} ← w${sub} − α·∇J${sub} = ${num(value)} − ${ALPHA} × ${paren(grad[col])} = <b>${signed(value - ALPHA * grad[col])}</b>`;
    });
  },
  // Le code compare la norme du gradient au seuil avant de mettre les poids à
  // jour. Le gradient testé est celui qui servirait à la mise à jour.
  stop: (m, w, rows, t) => {
    const grad = gradient(rows.map((row) => row.row), rows.map((row) => row.y), w);
    const size = Math.hypot(...grad);
    const lines = [
      '‖∇J‖ = √(∇J₀² + ∇J₁² + ∇J₂²)',
      `= √(${grad.map((value) => `(${value < 0 ? MINUS : ''}${Math.abs(value).toExponential(2)})²`).join(' + ')})`,
    ];
    if (t < LAST) return [...lines, `= ${size.toExponential(3)} ≥ 10⁻³ → <b>poursuite</b>`];
    if (CONVERGED) return [...lines, `= ${size.toExponential(3)} &lt; 10⁻³ → <b>arrêt</b>`];
    return [...lines, `= ${size.toExponential(3)} ≥ 10⁻³, mais itération ${t} = limite → <b>arrêt</b>`];
  },
  case: (m) => [
    `p = ${m.p.toFixed(3)} ${m.p > 0.5 ? '&gt; 0.5' : '≤ 0.5'} → ${m.pred ? tag(HOUSE) : 'autres maisons'}`,
    `étiquette y = ${m.y} → <b class="${m.miss ? 'ko' : ''}">${m.kase}</b>`,
  ],
  argmax: (m) => [
    m.decision.z.map((value, h) => `${zh(h)} = ${signed(value)}`).join(', '),
    `plus grand score : ${zh(m.decision.pred)} → réponse ${tag(m.decision.pred)}`,
    `maison réelle ${tag(m.student.h)} → ${m.wrong ? '<span class="ko">erreur</span>' : 'correct'}`,
  ],
};
