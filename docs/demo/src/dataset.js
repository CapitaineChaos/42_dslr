// Les six passages de l'entraînement : un par pli de validation croisée, puis
// le modèle final sur tous les élèves d'apprentissage. Chaque passage refait la
// préparation sur ses seuls élèves d'entraînement (médiane des notes présentes,
// puis moyenne et écart type de population sur les colonnes complétées), puis
// entraîne un modèle par maison, un contre tous, chacun par sa propre descente.
// compute() calcule tout une fois, au chargement, et la page attend la fin du
// calcul pour monter ses vues. L'itération devient ensuite un index dans la
// trace du modèle affiché.
//
// Le passage et la maison affichés sont exposés par des liaisons vivantes
// (`export let`). usePli() les réaffecte, et tout module qui lit TRACE, ROWS
// ou STATS au moment de dessiner voit le modèle courant.

import { DATA } from './data.js';
import { argmax, matrixOf, score } from './model.js';
import { fit, prepare } from './training.js';

export { DATA };

export const ALPHA = DATA.alpha;
export const EPSILON = 1e-3;
export const MAX_ITER = 6000;
export const COURSES = DATA.courses;
export const HOUSES = DATA.houses;
export const LEARN = DATA.train;
export const TEST = DATA.test;

export const K = 5;
export const FINAL = K;

// Plis stratifiés : dans chaque maison, les élèves sont distribués tour à tour
// entre les plis, en repartant du premier pli pour chaque maison.
export const FOLD_OF = new Map();
HOUSES.forEach((_, h) => {
  LEARN.filter((student) => student.h === h).forEach((student, i) => {
    FOLD_OF.set(student.id, i % K);
  });
});

// `report` reçoit chaque étape du calcul et rend la main au navigateur, qui
// peut alors dessiner la barre de chargement.
async function build(pli, report) {
  const held = pli < K ? LEARN.filter((student) => FOLD_OF.get(student.id) === pli) : [];
  const training = pli < K ? LEARN.filter((student) => FOLD_OF.get(student.id) !== pli) : LEARN;
  const stats = prepare(training, COURSES, DATA.stats);
  await report({ kind: 'prep', pli });

  // Note complétée par la médiane du passage, puis standardisée.
  const value = (student, col) => (student.imputed[col] ? stats[COURSES[col]].median : student.raw[col]);
  const features = (student) => COURSES.map((name, col) => (value(student, col) - stats[name].mu) / stats[name].sd);

  const rows = training.map((student) => [1, ...features(student)]);
  const models = [];
  for (let h = 0; h < HOUSES.length; h += 1) {
    models.push(fit(rows, training.map((student) => (student.h === h ? 1 : 0)), { alpha: ALPHA, epsilon: EPSILON, maxIter: MAX_ITER }));
    await report({ kind: 'descent', pli, house: h });
  }

  // Décision : un score par modèle, la maison du plus grand.
  const decide = (student) => {
    const row = [1, ...features(student)];
    const z = models.map((model) => score(model.weights, row));
    return { z, pred: argmax(z) };
  };

  // Le plan des notes standardisées garde des bornes carrées, car une distance
  // y a un sens, et un cadrage anisotrope fausserait l'angle de la frontière.
  const span = Math.max(...LEARN.concat(TEST).flatMap((student) => features(student).map(Math.abs))) * 1.14;

  const results = held.map((student) => ({ student, ...decide(student) }));
  const fitted = training.map((student) => ({ student, ...decide(student) }));

  return {
    pli,
    train: training,
    held,
    stats,
    value,
    features,
    rows,
    models,
    decide,
    fitted,
    ax: [-span, span],
    ay: [-span, span],
    results,
    correct: results.filter((result) => result.pred === result.student.h).length,
  };
}

export const PLIS = [];

// Passages parcourus : les six avec la validation croisée, le modèle final seul
// sans elle.
export const passesFor = (cv) => (cv ? PLIS : PLIS.slice(FINAL));

export let PLI;
export let HOUSE;
export let TRAIN;
export let HELD;
export let ROWS;
export let N;
export let STATS;
export let MODELS;
export let DECIDE;
export let FITTED;
export let AX;
export let AY;
export let FEATURES;
export let VALUE;
export let Y;
export let TRACE;
export let LAST;
export let CONVERGED;
export let UNBOUNDED;
export let W1;
export let W2;

export function usePli(pli, house) {
  const pass = PLIS[pli];
  const model = pass.models[house];
  PLI = pli;
  HOUSE = house;
  TRAIN = pass.train;
  HELD = pass.held;
  ROWS = pass.rows;
  N = pass.rows.length;
  STATS = pass.stats;
  MODELS = pass.models;
  DECIDE = pass.decide;
  FITTED = pass.fitted;
  AX = pass.ax;
  AY = pass.ay;
  FEATURES = pass.features;
  VALUE = pass.value;
  Y = model.y;
  TRACE = model.trace;
  LAST = model.last;
  CONVERGED = model.converged;
  UNBOUNDED = model.unbounded;
  W1 = model.w1;
  W2 = model.w2;
}

export const at = (t) => TRACE[Math.min(Math.max(t, 0), LAST)];
export const wAt = (t) => at(t).weights;

// Résultat hors pli de chaque élève d'apprentissage, total et matrice de
// confusion : une ligne par maison réelle, une colonne par maison attribuée.
export let OUT_OF_FOLD;
export let CV_CORRECT;
export let CV_MATRIX;

// Les six passages, puis le bilan de la validation croisée.
export async function compute(report) {
  for (let pli = 0; pli <= K; pli += 1) PLIS.push(await build(pli, report));
  usePli(0, 0);
  OUT_OF_FOLD = new Map(PLIS.slice(0, K).flatMap((pass) =>
    pass.results.map((result) => [result.student.id, { ...result, fold: pass.pli }])));
  CV_CORRECT = PLIS.slice(0, K).reduce((sum, pass) => sum + pass.correct, 0);
  CV_MATRIX = matrixOf(LEARN.map((student) => [student.h, OUT_OF_FOLD.get(student.id).pred]), HOUSES.length);
  await report({ kind: 'validation' });
}
