// Déplacements dans le cours et dans la descente.
//
// La boucle se referme d'elle-même : au bout de la mise à jour, suivant
// repart au score avec l'itération suivante. C'est ce qui fait qu'un passage
// complet des cinq thèmes de la boucle vaut exactement une itération.

import { STEPS } from './content/steps.js';
import { LAST } from './dataset.js';
import { emit, state } from './state.js';

export const LOOP_START = STEPS.findIndex((step) => step.phase === 'boucle');
export const LOOP_END = STEPS.map((step) => step.phase).lastIndexOf('boucle');

export function goto(index) {
  const target = Math.min(Math.max(index, 0), STEPS.length - 1);
  if (target === state.step) return;
  state.step = target;
  emit('step');
}

export function setIteration(t) {
  const target = Math.min(Math.max(Math.round(t), 0), LAST);
  if (target === state.t) return;
  state.t = target;
  emit('iteration');
}

export function goNext() {
  if (state.step === LOOP_END) {
    if (state.t < LAST) {
      setIteration(state.t + 1);
      goto(LOOP_START);
    } else {
      goto(LOOP_END + 1);
    }
    return;
  }
  goto(state.step + 1);
}

export function goPrev() {
  if (state.step === LOOP_START && state.t > 0) {
    setIteration(state.t - 1);
    goto(LOOP_END);
    return;
  }
  goto(state.step - 1);
}

export function exitLoop() {
  goto(LOOP_END + 1);
}
