// Schéma du parcours, tracé par flow/draw.js. Ce module tient son état : le
// nœud courant s'allume, les nœuds franchis restent marqués, la flèche qui mène
// au nœud courant s'anime, les flèches de retour des boucles en cours restent
// teintées.

import { NODES, STEPS } from '../content/steps.js';
import { FIRST } from '../navigation.js';
import { on, state } from '../state.js';
import { INSIDE, build, edges, nodes, pips } from './flow/draw.js';

function update() {
  const step = STEPS[state.step];
  const current = NODES.findIndex((node) => node.key === step.node);
  const inFrame = INSIDE.includes(step.phase);

  // Un nœud déjà traversé reste marqué : dans l'entraînement, dès le deuxième
  // passage ou le deuxième tour ; la validation, dès qu'un pli a été évalué.
  NODES.forEach((node, index) => {
    const group = nodes[node.key];
    const repeated = inFrame && INSIDE.includes(node.phase)
      && (state.pli > FIRST
        || (['maison', 'boucle'].includes(node.phase) && ['maison', 'boucle'].includes(step.phase) && state.house > 0)
        || (node.phase === 'boucle' && step.phase === 'boucle' && state.t > 0));
    const validated = node.phase === 'valid' && inFrame && state.pli > FIRST;
    group.classList.toggle('is-current', index === current);
    group.classList.toggle('is-done', index < current || repeated || validated);
    if (index === current) group.setAttribute('aria-current', 'step');
    else group.removeAttribute('aria-current');
  });

  pips.forEach(({ pip, index }) => pip.classList.toggle('is-current', index === state.step));

  // La tête d'une boucle s'atteint par l'entrée au premier tour, par le retour
  // ensuite : itération 0 ou non pour la correction, premier pli ou non pour
  // l'entraînement. Chaque branche de sortie s'allume à l'arrivée sur son nœud.
  const firstOfNode = STEPS.findIndex((candidate) => candidate.node === step.node) === state.step;
  const loopHead = NODES.find((node) => node.phase === 'boucle').key;
  const houseHead = NODES.find((node) => node.phase === 'maison').key;
  const frameHead = NODES.find((node) => INSIDE.includes(node.phase)).key;
  edges.forEach(({ path, to, kind }) => {
    let lit = firstOfNode && step.node === to;
    if (to === loopHead) lit = lit && (kind === 'return' ? state.t > 0 : state.t === 0);
    if (to === houseHead) lit = lit && (kind === 'house-return' ? state.house > 0 : state.house === 0);
    if (to === frameHead) lit = lit && (kind === 'outer-return' ? state.pli > FIRST : state.pli === FIRST);
    const live = (kind === 'return' && step.phase === 'boucle')
      || (kind === 'house-return' && ['maison', 'boucle'].includes(step.phase))
      || (kind === 'outer-return' && (inFrame || step.phase === 'valid'));
    path.classList.toggle('is-on', lit);
    path.classList.toggle('is-live', live && !lit);
    path.setAttribute('marker-end', lit ? 'url(#arrow-on)' : 'url(#arrow)');
  });
}

export function mount(goto) {
  build(goto);
  on('step', update);
  on('iteration', update);
  on('model', update);
  update();
}
