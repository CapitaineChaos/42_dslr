// Les trois commandes de bas de colonne. Au bout de la boucle, suivant devient
// itération suivante ; aller à l'arrêt saute à la dernière itération.

import { STEPS } from '../content/steps.js';
import { LAST } from '../dataset.js';
import { LOOP_END, exitLoop, goNext, goPrev } from '../navigation.js';
import { on, state } from '../state.js';

const previous = document.getElementById('prev');
const next = document.getElementById('next');
const exit = document.getElementById('exit');

function update() {
  const inLoop = STEPS[state.step].phase === 'boucle';
  const atLoopEnd = state.step === LOOP_END;
  next.textContent = atLoopEnd && state.t < LAST ? `itération ${state.t + 1}` : 'suivant';
  next.disabled = state.step === STEPS.length - 1;
  exit.hidden = !inLoop || (atLoopEnd && state.t === LAST);
  exit.textContent = `aller à l'arrêt · ${LAST}`;
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
