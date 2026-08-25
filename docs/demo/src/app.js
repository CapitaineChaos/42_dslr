// Amorçage : monte les vues, branche le clavier, lance le premier rendu.

import { STEPS } from './content/steps.js';
import { LAST, N, ROWS, Y, at, wAt } from './dataset.js';
import { errors } from './model.js';
import { goNext, goPrev, goto } from './navigation.js';
import { on, state } from './state.js';

import * as contents from './views/contents.js';
import * as figures from './views/figures.js';
import * as lesson from './views/lesson.js';
import * as nav from './views/nav.js';
import * as roster from './views/roster.js';
import * as settings from './views/settings.js';
import * as transport from './views/transport.js';
import { say } from './views/live.js';

settings.mount();
contents.mount(goto);
lesson.mount();
figures.mount();
roster.mount();
transport.mount();
nav.mount();

figures.follow();

on('step', () => {
  const step = STEPS[state.step];
  say(`${step.title}. Étape ${state.step + 1} sur ${STEPS.length}, section ${step.section}.`);
});

on('iteration', () => {
  say(`Itération ${state.t} sur ${LAST}. Perte ${at(state.t).cost.toFixed(4)}, ${errors(ROWS, Y, wAt(state.t))} erreurs sur ${N}.`);
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
