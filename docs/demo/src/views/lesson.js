// Panneau de cours. Deux rendus séparés : le titre, la formule et l'atelier ne
// bougent qu'au changement d'étape, la prose se réécrit à chaque itération. Sans
// cette séparation, MathJax retypographierait la formule à chaque cran du
// curseur d'itération.

import { STEPS } from '../content/steps.js';
import { LABS } from '../content/labs.js';
import { buildContext } from '../context.js';
import { on, state } from '../state.js';

const title = document.getElementById('title');
const formula = document.getElementById('formula');
const prose = document.getElementById('prose');
const lab = document.getElementById('lab');
const progress = document.getElementById('progress');

const step = () => STEPS[state.step];

function renderValues() {
  const context = buildContext(state.t);
  prose.innerHTML = step().prose(context);
}

function renderStep() {
  const current = step();
  title.textContent = current.title;
  formula.innerHTML = current.math ? `\\[${current.math}\\]` : '';
  progress.textContent = `étape ${state.step + 1} sur ${STEPS.length}`;

  lab.innerHTML = '';
  if (current.widget && LABS[current.widget]) LABS[current.widget](lab);

  renderValues();

  if (current.math && window.MathJax && window.MathJax.startup) {
    window.MathJax.startup.promise
      .then(() => window.MathJax.typesetPromise([formula]))
      .catch(() => {});
  }
}

export function mount() {
  on('step', renderStep);
  on('iteration', renderValues);
  renderStep();
}
