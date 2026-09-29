// Sélecteurs de passage (pli 1 à 5, modèle final) et de maison.
//
// Dans l'entraînement, choisir un passage mène à son début, ou à son arrêt
// après la boucle ; sur l'évaluation, au pli évalué ; ailleurs, à la médiane du
// passage. Choisir une maison mène au début de sa descente, dans la boucle.

import { STEPS } from '../../content/steps.js';
import { FINAL, HOUSES, K, LEARN, PLIS } from '../../dataset.js';
import { FRAME_START, HELD_STEP, enterLoop, goto, inFrame, setHouse, setModel, setPli } from '../../navigation.js';
import { state } from '../../state.js';
import { stop } from './play.js';

const passes = document.getElementById('pli');
const houses = document.getElementById('house');

function choosePass(pli) {
  stop();
  if (state.step === HELD_STEP && pli !== FINAL) setPli(pli, Infinity);
  else if (inFrame(state.step)) setPli(pli, STEPS[state.step].phase === 'post' ? Infinity : 0);
  else {
    goto(FRAME_START);
    setModel(pli, 0, 0);
  }
}

function chooseHouse(house) {
  stop();
  enterLoop();
  setHouse(house, 0);
}

function button(parent, text, label, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = 'button';
  element.textContent = text;
  element.setAttribute('aria-label', label);
  element.addEventListener('click', action);
  parent.appendChild(element);
  return element;
}

export function paint() {
  passes.querySelectorAll('button').forEach((element) => {
    element.setAttribute('aria-pressed', String(Number(element.dataset.pli) === state.pli));
  });
  houses.querySelectorAll('button').forEach((element) => {
    element.setAttribute('aria-pressed', String(Number(element.dataset.house) === state.house));
  });
}

export function mount() {
  PLIS.forEach((pass) => {
    const final = pass.pli === FINAL;
    const element = button(passes, final ? 'Final' : String(pass.pli + 1),
      final ? `Modèle final, ${LEARN.length} élèves` : `Pli ${pass.pli + 1} sur ${K}, mis de côté`,
      () => choosePass(pass.pli));
    element.dataset.pli = pass.pli;
  });
  HOUSES.forEach((house, h) => {
    const element = button(houses, house[0], `Modèle ${house}`, () => chooseHouse(h));
    element.dataset.house = h;
    element.classList.add('house', `h${h}`);
  });
}
