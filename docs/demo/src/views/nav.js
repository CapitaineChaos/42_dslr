// Les trois commandes de bas de colonne. Leurs libellés sont cités par le
// cours : itération suivante relance la boucle, sortir en fait sortir.

import { STEPS } from '../content/steps.js';
import { LAST } from '../dataset.js';
import { LOOP_END, exitLoop, goNext, goPrev } from '../navigation.js';
import { on, state } from '../state.js';

const previous = document.getElementById('prev');
const next = document.getElementById('next');
const exit = document.getElementById('exit');

function update() {
  const atLoopEnd = state.step === LOOP_END;
  next.textContent = atLoopEnd && state.t < LAST ? 'itération suivante' : 'suivant';
  next.disabled = state.step === STEPS.length - 1;
  exit.hidden = !atLoopEnd;
  previous.disabled = state.step === 0 && state.t === 0;
}

export function mount() {
  previous.addEventListener('click', goPrev);
  next.addEventListener('click', goNext);
  exit.addEventListener('click', exitLoop);
  on('step', update);
  on('iteration', update);
  update();
}
