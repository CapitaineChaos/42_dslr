// Déplacements dans le cours, dans la descente et entre les modèles.
//
// Trois boucles imbriquées, comme dans le code. La boucle de correction se
// referme d'elle-même : au bout de la mise à jour, suivant repart au score avec
// l'itération suivante. À l'arrêt, la boucle des maisons repart aux étiquettes
// avec la maison suivante ; après la dernière, la décision. La boucle des plis
// part de la validation : l'évaluation du pli k renvoie à la médiane avec le
// pli k + 1. Après le cinquième pli, le bilan, puis un dernier retour pour le
// modèle final, qui sort de l'entraînement vers la prédiction.

import { STEPS } from './content/steps.js';
import { FINAL, HOUSES, K, LAST, PLIS, usePli } from './dataset.js';
import { emit, state } from './state.js';

const INSIDE = ['prep', 'maison', 'boucle', 'post'];
const H = HOUSES.length;
const index = (id) => STEPS.findIndex((step) => step.id === id);

export const LOOP_START = STEPS.findIndex((step) => step.phase === 'boucle');
export const LOOP_END = STEPS.map((step) => step.phase).lastIndexOf('boucle');
export const HOUSE_STEP = STEPS.findIndex((step) => step.phase === 'maison');
export const FRAME_START = STEPS.findIndex((step) => INSIDE.includes(step.phase));
export const FRAME_END = STEPS.map((step) => INSIDE.includes(step.phase)).lastIndexOf(true);
export const HELD_STEP = index('evaluation-pli');
export const VALID_END = STEPS.map((step) => step.phase).lastIndexOf('valid');
export const PREDICT = index('prediction');

export const inFrame = (at) => INSIDE.includes(STEPS[at].phase);

// Frise des dix-huit descentes mises bout à bout, passage par passage et maison
// par maison : une position globale par état de poids.
const RUNS = PLIS.flatMap((pass) => pass.models.map((model, house) => ({ pli: pass.pli, house, last: model.last })));
const OFFSETS = RUNS.reduce((starts, run, i) => [...starts, i ? starts[i - 1] + RUNS[i - 1].last + 1 : 0], []);
const SPAN = OFFSETS[RUNS.length - 1] + RUNS[RUNS.length - 1].last;

const globalOf = (pli, house, t) => OFFSETS[pli * H + house] + t;

function localOf(position) {
  const clamped = Math.min(Math.max(Math.round(position), 0), SPAN);
  let run = RUNS.length - 1;
  while (run > 0 && OFFSETS[run] > clamped) run -= 1;
  return { pli: RUNS[run].pli, house: RUNS[run].house, t: clamped - OFFSETS[run] };
}

export function setIteration(t) {
  const target = Math.min(Math.max(Math.round(t), 0), LAST);
  if (target === state.t) return;
  state.t = target;
  emit('iteration');
}

// Changer de passage ou de maison change les données : les vues abonnées à
// 'model' recalculent ce qu'elles avaient figé, puis l'itération est replacée.
export function setModel(pli, house, t = state.t) {
  if (pli !== state.pli || house !== state.house) {
    state.pli = pli;
    state.house = house;
    usePli(pli, house);
    emit('model');
  }
  state.t = Math.min(Math.max(Math.round(t), 0), LAST);
  emit('iteration');
}

export const setPli = (pli, t) => setModel(pli, state.house, t);
export const setHouse = (house, t) => setModel(state.pli, house, t);

// Déplacement sur la frise : au-delà de l'arrêt d'une descente, on continue au
// début de la suivante.
export function moveTo(position) {
  const { pli, house, t } = localOf(position);
  setModel(pli, house, t);
}

export function shift(delta) {
  moveTo(globalOf(state.pli, state.house, state.t) + delta);
}

function show(target) {
  if (target === state.step) return;
  state.step = target;
  emit('step');
}

// Après la boucle des maisons, les trois modèles sont à l'arrêt : les étapes
// qui suivent montrent la dernière descente terminée. L'évaluation montre un pli
// de validation ; le bilan, le dernier pli ; la prédiction, le modèle final.
export function goto(at) {
  const target = Math.min(Math.max(at, 0), STEPS.length - 1);
  const phase = STEPS[target].phase;
  if (target === HELD_STEP) setModel(state.pli === FINAL ? K - 1 : state.pli, H - 1, Infinity);
  else if (phase === 'post') setModel(state.pli, H - 1, Infinity);
  else if (phase === 'valid') setModel(K - 1, H - 1, Infinity);
  else if (phase === 'aval') setModel(FINAL, H - 1, Infinity);
  show(target);
}

export function goNext() {
  if (state.step === HOUSE_STEP - 1) {
    setHouse(0, 0);
    show(HOUSE_STEP);
    return;
  }
  if (state.step === LOOP_END) {
    if (state.t < LAST) {
      setIteration(state.t + 1);
      show(LOOP_START);
    } else if (state.house < H - 1) {
      setHouse(state.house + 1, 0);
      show(HOUSE_STEP);
    } else {
      show(LOOP_END + 1);
    }
    return;
  }
  if (state.step === FRAME_END) {
    goto(state.pli === FINAL ? PREDICT : HELD_STEP);
    return;
  }
  if (state.step === HELD_STEP && state.pli < K - 1) {
    setModel(state.pli + 1, 0, 0);
    show(FRAME_START);
    return;
  }
  if (state.step === VALID_END) {
    setModel(FINAL, 0, 0);
    show(FRAME_START);
    return;
  }
  goto(state.step + 1);
}

export function goPrev() {
  if (state.step === LOOP_START && state.t > 0) {
    setIteration(state.t - 1);
    show(LOOP_END);
    return;
  }
  if (state.step === HOUSE_STEP && state.house > 0) {
    setHouse(state.house - 1, Infinity);
    show(LOOP_END);
    return;
  }
  if (state.step === LOOP_END + 1) {
    setHouse(H - 1, Infinity);
    show(LOOP_END);
    return;
  }
  if (state.step === FRAME_START && state.pli > 0) {
    if (state.pli === FINAL) goto(VALID_END);
    else {
      setModel(state.pli - 1, H - 1, Infinity);
      show(HELD_STEP);
    }
    return;
  }
  if (state.step === HELD_STEP || state.step === PREDICT) {
    setModel(state.pli, H - 1, Infinity);
    show(FRAME_END);
    return;
  }
  goto(state.step - 1);
}

// Hors de l'entraînement, l'étape ne suit pas l'itération : les commandes
// d'itération entrent d'abord dans la boucle de correction.
export function enterLoop() {
  if (!inFrame(state.step)) goto(LOOP_START);
}

// La boucle du code ne s'interrompt qu'au critère d'arrêt ou à la limite : en
// sortir, c'est aller à la dernière itération, sur l'étape du critère.
export function exitLoop() {
  setIteration(LAST);
  show(LOOP_END);
}
