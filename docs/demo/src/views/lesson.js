// Panneau de cours. Deux rendus séparés : le titre, la formule et l'atelier ne
// bougent qu'au changement d'étape, les textes se réécrivent à chaque
// itération. Sans cette séparation, MathJax retypographierait la formule à
// chaque cran du curseur d'itération.

import { NODES, STEPS } from '../content/steps.js';
import { LABS } from '../content/labs.js';
import { buildContext } from '../context.js';
import { on, state } from '../state.js';

const where = document.getElementById('where');
const title = document.getElementById('title');
const formula = document.getElementById('formula');
const lead = document.getElementById('lead');
const more = document.getElementById('more');
const lab = document.getElementById('lab');

const step = () => STEPS[state.step];

function locate(current) {
  const node = NODES.find((candidate) => candidate.key === current.node);
  const siblings = STEPS.filter((candidate) => candidate.node === current.node);
  const rank = siblings.length > 1 ? ` · ${siblings.indexOf(current) + 1}/${siblings.length}` : '';
  const phase = {
    amont: 'préparation',
    boucle: `boucle de correction · itération ${state.t}`,
    aval: 'après la boucle',
  }[current.phase];
  return `<span class="where-phase phase-${current.phase}">${phase}</span>
    <span class="where-node">${node.label}${rank}</span>`;
}

function renderValues() {
  const current = step();
  const context = buildContext(state.t);
  where.innerHTML = locate(current);
  lead.innerHTML = current.lead(context);
  more.innerHTML = current.more(context);
}

function renderStep() {
  const current = step();
  title.textContent = current.title;
  formula.innerHTML = current.math ? `\\[${current.math}\\]` : '';

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
