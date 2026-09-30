// Monte les vues, branche le clavier, lance le premier rendu. Importé par
// boot.js à Démarrer, une fois les données calculées et les options fixées.

import { STEPS } from './content/steps.js';
import { plural } from './content/steps/format.js';
import { FINAL, HOUSES, K, LAST, N, ROWS, Y, at, wAt } from './dataset.js';
import { errors } from './model.js';
import { goNext, goPrev, goto } from './navigation.js';
import { on, state } from './state.js';

import * as calc from './views/calc.js';
import * as figures from './views/figures.js';
import * as flow from './views/flow.js';
import * as lesson from './views/lesson.js';
import * as nav from './views/nav.js';
import * as panels from './views/panels.js';
import * as theme from './views/theme.js';
import * as tooltip from './views/tooltip.js';
import * as transport from './views/transport.js';
import * as wiki from './views/wiki.js';
import { say } from './views/live.js';

flow.mount(goto);
lesson.mount();
calc.mount();
figures.mount();
transport.mount();
nav.mount();
panels.mount();
theme.mount();
wiki.mount();
tooltip.mount();

figures.follow();

on('step', () => {
  const step = STEPS[state.step];
  say(`${step.title}. Étape ${state.step + 1} sur ${STEPS.length}.`);
});

on('model', () => {
  const pass = state.pli === FINAL ? `Modèle final, ${N} élèves` : `Pli ${state.pli + 1} sur ${K} mis de côté, ${N} élèves d'entraînement`;
  say(`${pass}, modèle ${HOUSES[state.house]}.`);
});

on('iteration', () => {
  const wrong = errors(ROWS, Y, wAt(state.t));
  say(`Itération ${state.t} sur ${LAST}. Coût ${at(state.t).cost.toFixed(4)}, ${wrong} ${plural(wrong, 'erreur', 'erreurs')} sur ${N}.`);
});

// Les flèches parcourent le cours, l'espace lance et arrête la lecture, Échap
// referme un agrandissement. Dans un champ ou sur une carte de figure, ces
// touches gardent leur rôle propre.
window.addEventListener('keydown', (event) => {
  const target = event.target;
  const inControl = target instanceof Element && target.closest('input, select, textarea, .plot');

  if (event.key === 'Escape' && state.zoom !== null) figures.zoom(null);
  if (inControl) return;

  if (event.key === 'ArrowRight') { event.preventDefault(); goNext(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); goPrev(); }
  if (event.key === ' ' && (target === document.body || target.id === 'lesson')) {
    event.preventDefault();
    transport.togglePlay();
  }
});

// La promesse est tenue quand les figures ont eu deux images pour se
// dessiner.
export async function ready() {
  await new Promise((resolve) => { requestAnimationFrame(() => requestAnimationFrame(resolve)); });
}
