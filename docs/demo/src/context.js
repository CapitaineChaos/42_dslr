// Valeurs que les textes du cours peuvent citer. Les nombres ne sont jamais
// écrits en dur dans le contenu. Ils sont calculés ici, au moment de l'appel,
// pour le passage et la maison affichés.

import { config } from './config.js';
import { errors, gradient, matrixOf, norm, report, score, sigmoid } from './model.js';
import {
  ALPHA, CONVERGED, COURSES, CV_CORRECT, CV_MATRIX, FINAL, FITTED, HELD, HOUSE, HOUSES, K, LAST, LEARN, MAX_ITER,
  MODELS, N, PLI, PLIS, ROWS, STATS, TEST, TRACE, TRAIN, UNBOUNDED, VALUE, Y, at, wAt,
} from './dataset.js';

const f3 = (value) => value.toFixed(3);
const signed = (value) => `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(3)}`;
const pct = (value) => (value === null ? 'indéfini' : `${(value * 100).toFixed(1)} %`);
const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}` : items[0]);

const ALL_MISSING = LEARN.concat(TEST).reduce((sum, student) => sum + student.imputed.filter(Boolean).length, 0);

// Tailles des plis, en texte : « 5, 5, 5, 5 et 5 élèves ».
const FOLD_SIZES = `${list(PLIS.slice(0, K).map((pass) => pass.held.length))} élèves`;

// Scores de chaque maison, mis en forme pour le texte.
const shown = (matrix) => {
  const out = report(matrix);
  return {
    ...out,
    houses: out.houses.map((house, h) => ({
      name: HOUSES[h], precision: pct(house.precision), recall: pct(house.recall), f1: pct(house.f1),
    })),
    accuracy: pct(out.accuracy),
  };
};

// Erreurs hors diagonale d'une matrice, en texte.
function confusions(matrix) {
  const out = [];
  matrix.forEach((row, real) => row.forEach((count, predicted) => {
    if (real !== predicted && count) {
      out.push(`${count} ${count > 1 ? 'élèves' : 'élève'} de ${HOUSES[real]} ${count > 1 ? 'classés' : 'classé'} ${HOUSES[predicted]}`);
    }
  }));
  return out.length ? list(out) : 'aucune erreur';
}

const CV = { matrix: CV_MATRIX, ...shown(CV_MATRIX), text: confusions(CV_MATRIX) };
const FINAL_PASS = PLIS[FINAL];
const TEST_CORRECT = TEST.filter((student) => FINAL_PASS.decide(student).pred === student.h).length;

// Notes absentes parmi les élèves d'entraînement du passage, comblées par sa
// médiane : élève, matière, valeur.
function missing() {
  return TRAIN.flatMap((student) => student.imputed
    .map((absent, col) => (absent ? { name: student.name, label: STATS[COURSES[col]].label, value: VALUE(student, col) } : null))
    .filter(Boolean));
}

export function buildContext(t) {
  const w = wAt(t);
  const wNext = wAt(Math.min(t + 1, LAST));
  const g = gradient(ROWS, Y, w);
  const zs = ROWS.map((row) => score(w, row));
  const wrong = errors(ROWS, Y, w);
  const jNow = at(t).cost;
  const jNext = at(Math.min(t + 1, LAST)).cost;

  const stat = (index) => STATS[COURSES[index]];
  const final = PLI === FINAL;
  const trainMatrix = matrixOf(FITTED.map((result) => [result.student.h, result.pred]), HOUSES.length);
  const trainReport = shown(trainMatrix);
  const heldCorrect = HELD.filter((student) => PLIS[PLI].decide(student).pred === student.h).length;

  return {
    t,
    pli: PLI,
    final,
    crossValidation: config.cv,
    k: K,
    learnCount: LEARN.length,
    total: LEARN.length + TEST.length,
    foldSizes: FOLD_SIZES,
    folds: PLIS.slice(0, K).map((pass) => ({
      correct: pass.correct,
      converged: pass.models.every((model) => model.converged),
    })),
    cvCorrect: CV_CORRECT,
    cvAccuracy: ((CV_CORRECT / LEARN.length) * 100).toFixed(1),
    cv: CV,
    allMissing: ALL_MISSING,
    missing: missing(),
    trainers: final
      ? `les ${N} élèves d'apprentissage`
      : `les ${N} élèves d'entraînement, hors pli ${PLI + 1}`,
    outside: final ? 'aux élèves réservés' : `aux élèves du pli ${PLI + 1} et aux élèves réservés`,
    heldCount: HELD.length,
    heldCorrect,
    houses: HOUSES,
    houseCount: HOUSES.length,
    houseList: list(HOUSES),
    house: HOUSES[HOUSE],
    houseIndex: HOUSE,
    others: list(HOUSES.filter((_, h) => h !== HOUSE)),
    positives: Y.reduce((total, y) => total + y, 0),
    stops: list(MODELS.map((model, h) => `${model.last} pour ${HOUSES[h]}`)),
    limited: MODELS.map((model, h) => (model.converged ? null : { house: HOUSES[h], last: model.last, unbounded: model.unbounded }))
      .filter(Boolean),
    label0: stat(0).label,
    label1: stat(1).label,
    max0: stat(0).max,
    max1: stat(1).max,
    median0: stat(0).median.toFixed(2),
    median1: stat(1).median.toFixed(2),
    mu0: stat(0).mu.toFixed(2),
    mu1: stat(1).mu.toFixed(2),
    sd0: stat(0).sd.toFixed(2),
    sd1: stat(1).sd.toFixed(2),
    wf: w.map(signed),
    wnf: wNext.map(signed),
    gf: g.map(signed),
    slope: (Math.hypot(w[1], w[2]) / 4).toFixed(3),
    last: LAST,
    converged: CONVERGED,
    unbounded: UNBOUNDED,
    maxIter: MAX_ITER,
    alpha: ALPHA,
    n: N,
    courses: COURSES,
    stats: STATS,
    testCount: TEST.length,
    testCorrect: TEST_CORRECT,
    w,
    wText: w.map(f3).join('  '),
    wNextText: wNext.map(f3).join('  '),
    stepText: g.map((value) => f3(-ALPHA * value)).join('  '),
    gradText: g.map(f3).join('  '),
    gradNorm: norm(g).toExponential(3),
    zMin: signed(Math.min(...zs)),
    zMax: signed(Math.max(...zs)),
    pMin: f3(Math.min(...zs.map(sigmoid))),
    pMax: f3(Math.max(...zs.map(sigmoid))),
    cost: jNow.toFixed(6),
    costNext: jNext.toFixed(6),
    costStart: TRACE[0].cost.toFixed(6),
    costEnd: TRACE[LAST].cost.toFixed(6),
    errors: wrong,
    accuracy: ((1 - wrong / N) * 100).toFixed(1),
    finalErrors: errors(ROWS, Y, TRACE[LAST].weights),
    trainCorrect: trainReport.good,
    trainReport,
    trainText: confusions(trainMatrix),
  };
}
