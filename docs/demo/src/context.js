// Tout ce que la prose du cours peut citer. Les nombres ne sont jamais écrits en
// dur dans le contenu : ils viennent d'ici.

import { confusion, errors, gradient, norm, score, sigmoid } from './model.js';
import {
  ALPHA, CONVERGED, COURSES, DATA, FEATURES, LAST, N, RAW, ROWS, STATS, TEST, TRACE, Y,
  at, wAt,
} from './dataset.js';

const f3 = (value) => value.toFixed(3);

export function buildContext(t) {
  const w = wAt(t);
  const wNext = wAt(Math.min(t + 1, LAST));
  const g = gradient(ROWS, Y, w);
  const zs = ROWS.map((row) => score(w, row));
  const testRows = TEST.map((student) => [1, ...FEATURES(student)]);
  const testY = TEST.map((student) => student.y);
  const wrong = errors(ROWS, Y, w);
  const m = confusion(ROWS, Y, w);
  const jNow = at(t).cost;
  const jNext = at(Math.min(t + 1, LAST)).cost;

  return {
    t,
    last: LAST,
    converged: CONVERGED,
    alpha: ALPHA,
    n: N,
    positive: DATA.positive,
    negative: DATA.negative,
    positives: Y.reduce((total, y) => total + y, 0),
    raw: RAW,
    courses: COURSES,
    stats: STATS,
    testCount: TEST.length,
    testErrors: errors(testRows, testY, w),
    w,
    wText: w.map(f3).join('  '),
    wNextText: wNext.map(f3).join('  '),
    stepText: g.map((value) => f3(-ALPHA * value)).join('  '),
    gradText: g.map(f3).join('  '),
    gradNorm: norm(g).toExponential(3),
    zMin: f3(Math.min(...zs)),
    zMax: f3(Math.max(...zs)),
    pMin: f3(Math.min(...zs.map(sigmoid))),
    pMax: f3(Math.max(...zs.map(sigmoid))),
    cost: jNow.toFixed(6),
    costNext: jNext.toFixed(6),
    costStart: TRACE[0].cost.toFixed(6),
    costEnd: TRACE[LAST].cost.toFixed(6),
    relative: (Math.abs(jNow - jNext) / Math.max(1, Math.abs(jNext))).toExponential(2),
    errors: wrong,
    accuracy: ((1 - wrong / N) * 100).toFixed(1),
    tp: m.tp, fp: m.fp, fn: m.fn, tn: m.tn,
    precision: m.precision === null ? null : (m.precision * 100).toFixed(1),
    recall: m.recall === null ? null : (m.recall * 100).toFixed(1),
    finalErrors: errors(ROWS, Y, TRACE[LAST].weights),
  };
}
