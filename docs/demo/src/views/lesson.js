// Panneau de cours. Deux rendus séparés : le titre, la formule et l'atelier ne
// bougent qu'au changement d'étape, les textes se réécrivent à chaque
// itération. Sans cette séparation, MathJax retypographierait la formule à
// chaque cran du curseur d'itération.
//
// Au changement d'étape, le cours remonte en haut et le texte réserve sa plus
// grande hauteur (views/steady.js) ; la formule reste masquée tant que MathJax
// ne l'a pas écrite, dans un cadre de hauteur fixe.

import { NODES, STEPS } from '../content/steps.js';
import { LABS } from '../content/labs.js';
import { buildContext } from '../context.js';
import { FINAL, HOUSES, K } from '../dataset.js';
import { on, state } from '../state.js';
import { reserve } from './steady.js';

const scroller = document.querySelector('.lesson-scroll');
const where = document.getElementById('where');
const title = document.getElementById('title');
const formula = document.getElementById('formula');
const lead = document.getElementById('lead');
const more = document.getElementById('more');
const moreTitle = document.getElementById('more-title');
const lab = document.getElementById('lab');

const step = () => STEPS[state.step];

let written = Promise.resolve();

function passage() {
  return state.pli === FINAL ? 'modèle final' : `pli ${state.pli + 1} sur ${K}`;
}

// Une seule ligne : la position se tronque plutôt que de pousser le titre.
function locate(current) {
  const node = NODES.find((candidate) => candidate.key === current.node);
  const siblings = STEPS.filter((candidate) => candidate.node === current.node);
  const rank = siblings.length > 1 ? ` · ${siblings.indexOf(current) + 1}/${siblings.length}` : '';
  const phase = {
    intro: '',
    amont: 'avant l\'entraînement',
    prep: `entraînement · ${passage()}`,
    maison: `${passage()} · modèle ${HOUSES[state.house]}`,
    boucle: `${passage()} · modèle ${HOUSES[state.house]}`,
    post: `${passage()} · ${HOUSES.length} modèles`,
    valid: current.id === 'evaluation-pli' ? `pli ${state.pli + 1} sur ${K} mis de côté` : `${K} plis réunis`,
    aval: 'modèle final',
  }[current.phase];
  const inside = ['prep', 'maison', 'boucle', 'post', 'valid'].includes(current.phase);
  const lead = phase ? `<span class="where-phase ${inside ? 'phase-boucle' : ''}">${phase}</span>` : '';
  return `${lead}<span class="where-node">${node.label}${rank}</span>`;
}

function drawLead(t) {
  lead.innerHTML = step().lead(buildContext(t));
}

function drawMore(t) {
  more.innerHTML = step().more(buildContext(t));
}

function renderValues() {
  const context = buildContext(state.t);
  lead.innerHTML = step().lead(context);
  more.innerHTML = step().more(context);
}

function fitLead() {
  reserve(lead, drawLead, state.t);
  reserve(more, drawMore, state.t);
}

function renderStep() {
  const current = step();
  scroller.scrollTop = 0;
  where.innerHTML = locate(current);
  title.textContent = current.title;
  moreTitle.textContent = current.moreTitle || 'Détail mathématique';

  formula.classList.add('pending');
  formula.innerHTML = current.math ? `\\[${current.math}\\]` : '';

  lab.innerHTML = '';
  if (current.widget && LABS[current.widget]) LABS[current.widget](lab);

  renderValues();
  fitLead();

  if (current.math && window.MathJax && window.MathJax.startup) {
    written = window.MathJax.startup.promise
      .then(() => window.MathJax.typesetPromise([formula]))
      .catch(() => {})
      .then(() => formula.classList.remove('pending'));
  } else {
    formula.classList.remove('pending');
    written = Promise.resolve();
  }
}

// Promesse tenue quand la formule de l'étape affichée est écrite.
export const typeset = () => written;

export function mount() {
  on('step', renderStep);
  on('iteration', renderValues);
  on('model', () => {
    where.innerHTML = locate(step());
    fitLead();
  });
  renderStep();

  // La hauteur réservée dépend de la largeur de la colonne.
  let width = scroller.clientWidth;
  new ResizeObserver(() => {
    if (scroller.clientWidth === width) return;
    width = scroller.clientWidth;
    fitLead();
  }).observe(scroller);
}
