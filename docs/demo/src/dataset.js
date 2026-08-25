// Jeu de données choisi, matrices d'apprentissage, trajectoire complète de la
// descente et cadrage des figures. Tout ce qui ne dépend pas de l'itération
// courante se calcule une fois, au chargement.

import { DATA } from './data.js';
import { descend } from './model.js';

export { DATA };

// Mode démonstration : les notes entrent telles quelles, sans être ramenées à
// une échelle commune. Rien d'autre ne change : même α, même code. Le mode
// passe par l'URL : en changer recharge la page plutôt que de démêler un état
// dont tout dépend : trace, relief, bornes des figures.
export const RAW = new URLSearchParams(location.search).get('brut') === '1';
export const FEATURES = (student) => (RAW ? student.raw : student.x);

export const TRAIN = DATA.train;
export const TEST = DATA.test;
export const ROWS = TRAIN.map((student) => [1, ...FEATURES(student)]);
export const Y = TRAIN.map((student) => student.y);
export const N = ROWS.length;
export const ALPHA = DATA.alpha;
export const STATS = DATA.stats;
export const COURSES = DATA.courses;

// La trajectoire entière est calculée d'un coup : l'itération devient un index,
// ce qui permet d'y sauter dans les deux sens sans jamais recalculer.
const MAX_ITER = 6000;
const RUN = descend(ROWS, Y, { alpha: ALPHA, epsilon: 1e-6, maxIter: MAX_ITER });

export const TRACE = RUN.trace;
export const LAST = TRACE.length - 1;

// Le critère d'arrêt n'a pas forcément joué : sur un jeu presque séparable la
// perte décroît encore quand la limite d'itérations tombe. L'interface doit dire
// lequel des deux a mis fin à la descente.
export const CONVERGED = TRACE.length < MAX_ITER;

export const at = (t) => TRACE[Math.min(Math.max(t, 0), LAST)];
export const wAt = (t) => at(t).weights;

function bounds(values, pad = 0.12, includeZero = false) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (includeZero) { lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
  const span = (hi - lo) || 1;
  return [lo - span * pad, hi + span * pad];
}

// En coordonnées standardisées le plan garde des bornes carrées : une distance y
// a un sens, et un cadrage anisotrope fausserait l'angle de la frontière. Sur
// les notes brutes chaque axe suit sa matière.
export const [AX, AY] = (() => {
  const every = TRAIN.concat(TEST);
  if (!RAW) {
    const span = Math.max(...every.flatMap((student) => student.x.map(Math.abs))) * 1.14;
    return [[-span, span], [-span, span]];
  }
  return [
    bounds(every.map((student) => student.raw[0]), 0.08),
    bounds(every.map((student) => student.raw[1]), 0.08),
  ];
})();

// Le plan des poids suit l'amplitude réellement parcourue par chaque
// coefficient, origine comprise puisque la descente y démarre.
export const W1 = bounds(TRACE.map((entry) => entry.weights[1]), 0.16, true);
export const W2 = bounds(TRACE.map((entry) => entry.weights[2]), 0.16, true);

export const urlFor = (raw) => (raw ? '?brut=1' : '?');
