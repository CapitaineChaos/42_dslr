// Schéma du parcours : préparation, boucle de correction, décision.
//
// Un nœud par groupe d'étapes, une pastille par étape sous son libellé. La
// boucle est un cadre dont la flèche de retour porte le compteur d'itérations ;
// on n'en sort que par la flèche d'arrêt. Le nœud courant s'allume, la flèche
// qui y mène s'anime, les nœuds déjà franchis restent marqués.

import { NODES, STEPS } from '../content/steps.js';
import { CONVERGED, LAST } from '../dataset.js';
import { on, state } from '../state.js';

const host = document.getElementById('flow');
const NS = 'http://www.w3.org/2000/svg';

const W = 118;
const H = 70;
const GAP = 34;
const EXIT = 70;
const PAD = 18;
const FRAME_Y = 6;
const NODE_Y = FRAME_Y + 32;
const RETURN_Y = NODE_Y + H + 26;
const FRAME_H = RETURN_Y + 22 - FRAME_Y;
const HEIGHT = FRAME_Y + FRAME_H + 6;

const nodes = {};
const pips = [];
const edges = [];
let frame = null;
let badge = null;
let badgeBox = null;

function el(name, attributes = {}, parent = null) {
  const element = document.createElementNS(NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (parent) parent.appendChild(element);
  return element;
}

function layout() {
  const place = {};
  let x = 8;
  const put = (node) => { place[node.key] = { x, y: NODE_Y }; x += W + GAP; };

  NODES.filter((node) => node.phase === 'amont').forEach(put);
  const frameX = x - 6;
  x = frameX + PAD;
  NODES.filter((node) => node.phase === 'boucle').forEach(put);
  const frameW = x - GAP + PAD - frameX;
  x = frameX + frameW + EXIT;
  NODES.filter((node) => node.phase === 'aval').forEach(put);

  return { place, frameX, frameW, width: x - GAP + 8 };
}

function arrowMarker(defs, id) {
  const marker = el('marker', {
    id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7,
    orient: 'auto-start-reverse',
  }, defs);
  el('path', { d: 'M 0 1 L 9 5 L 0 9 z', class: `arrow-head ${id}` }, marker);
}

function edge(svg, d, from, to, extra = '') {
  const path = el('path', { d, class: `edge ${extra}`, 'marker-end': 'url(#arrow)' }, svg);
  edges.push({ path, from, to });
  return path;
}

function nodeGroup(svg, node, at, goto) {
  const indices = STEPS.map((step, index) => (step.node === node.key ? index : -1)).filter((i) => i >= 0);
  const group = el('g', {
    class: `node phase-${node.phase}`,
    role: 'button',
    tabindex: 0,
    'aria-label': `${node.label}, ${indices.length} étape${indices.length > 1 ? 's' : ''}`,
  }, svg);

  el('rect', { x: at.x, y: at.y, width: W, height: H, rx: 12, class: 'node-box' }, group);
  el('text', { x: at.x + W / 2, y: at.y + 25, class: 'node-label' }, group).textContent = node.label;
  el('text', { x: at.x + W / 2, y: at.y + 44, class: 'node-caption' }, group).textContent = node.caption;

  const enter = () => goto(indices[0]);
  group.addEventListener('click', enter);
  group.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); enter(); }
  });

  if (indices.length > 1) {
    const spacing = 16;
    const first = at.x + W / 2 - ((indices.length - 1) * spacing) / 2;
    indices.forEach((index, rank) => {
      const pip = el('circle', { cx: first + rank * spacing, cy: at.y + H - 12, r: 4, class: 'pip' }, group);
      const hit = el('circle', {
        cx: first + rank * spacing, cy: at.y + H - 12, r: 8, class: 'pip-hit',
      }, group);
      el('title', {}, hit).textContent = STEPS[index].title;
      hit.addEventListener('click', (event) => { event.stopPropagation(); goto(index); });
      pips.push({ pip, index });
    });
  }

  nodes[node.key] = group;
}

function build(goto) {
  const { place, frameX, frameW, width } = layout();
  const svg = el('svg', {
    viewBox: `0 0 ${width} ${HEIGHT}`,
    class: 'flow-svg',
    role: 'group',
    'aria-label': 'Parcours',
  });

  const defs = el('defs', {}, svg);
  arrowMarker(defs, 'arrow');
  arrowMarker(defs, 'arrow-on');
  const glow = el('filter', { id: 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
  el('feGaussianBlur', { stdDeviation: 5, result: 'blur' }, glow);
  const merge = el('feMerge', {}, glow);
  el('feMergeNode', { in: 'blur' }, merge);
  el('feMergeNode', { in: 'SourceGraphic' }, merge);

  frame = el('g', { class: 'loop-frame' }, svg);
  el('rect', { x: frameX, y: FRAME_Y, width: frameW, height: FRAME_H, rx: 16, class: 'frame-box' }, frame);
  el('text', { x: frameX + 16, y: FRAME_Y + 20, class: 'frame-label' }, frame).textContent = 'boucle de correction';

  const order = NODES.map((node) => node.key);
  const center = (key) => place[key].y + H / 2;
  for (let i = 0; i < order.length - 1; i += 1) {
    const from = order[i];
    const to = order[i + 1];
    const x1 = place[from].x + W;
    const x2 = place[to].x;
    const exit = NODES[i].phase === 'boucle' && NODES[i + 1].phase === 'aval';
    edge(svg, `M ${x1} ${center(from)} L ${x2 - 2} ${center(to)}`, from, to, exit ? 'edge-exit' : '');
    if (exit) {
      const label = CONVERGED ? 'arrêt' : 'limite';
      const border = frameX + frameW;
      el('text', { x: (border + x2) / 2, y: center(from) - 10, class: 'edge-label' }, svg).textContent = label;
    }
  }

  const loop = NODES.filter((node) => node.phase === 'boucle').map((node) => node.key);
  const head = place[loop[0]];
  const tail = place[loop[loop.length - 1]];
  const back = edge(
    svg,
    `M ${tail.x + W / 2} ${tail.y + H} V ${RETURN_Y} H ${head.x + W / 2} V ${head.y + H + 2}`,
    loop[loop.length - 1], loop[0], 'edge-return',
  );
  back.dataset.return = '';

  const middle = (head.x + tail.x + W) / 2;
  const wide = (`↺ itération ${LAST} / ${LAST}`.length) * 8 + 28;
  badgeBox = el('rect', { x: middle - wide / 2, y: RETURN_Y - 12, width: wide, height: 24, rx: 12, class: 'badge-box' }, svg);
  badge = el('text', { x: middle, y: RETURN_Y + 5, class: 'badge' }, svg);

  NODES.forEach((node) => nodeGroup(svg, node, place[node.key], goto));

  host.appendChild(svg);
}

function update() {
  const step = STEPS[state.step];
  const order = NODES.map((node) => node.key);
  const current = order.indexOf(step.node);

  NODES.forEach((node, index) => {
    const group = nodes[node.key];
    group.classList.toggle('is-current', index === current);
    group.classList.toggle('is-done', index < current || (node.phase === 'boucle' && state.t > 0 && step.phase === 'boucle'));
    if (index === current) group.setAttribute('aria-current', 'step');
    else group.removeAttribute('aria-current');
  });

  pips.forEach(({ pip, index }) => pip.classList.toggle('is-current', index === state.step));

  frame.classList.toggle('is-active', step.phase === 'boucle');
  frame.classList.toggle('is-done', step.phase === 'aval');

  const firstOfNode = STEPS.findIndex((candidate) => candidate.node === step.node) === state.step;
  // Le score s'atteint par l'entrée à l'itération 0, par le retour ensuite.
  const loopHead = NODES.find((node) => node.phase === 'boucle').key;
  edges.forEach(({ path, to }) => {
    const back = path.dataset.return !== undefined;
    const arriving = step.node === to && firstOfNode;
    let on = arriving;
    if (to === loopHead) on = arriving && (back ? state.t > 0 : state.t === 0);
    path.classList.toggle('is-on', on);
    path.setAttribute('marker-end', on ? 'url(#arrow-on)' : 'url(#arrow)');
  });

  badgeBox.classList.toggle('is-on', step.phase === 'boucle');
}

function count() {
  badge.textContent = `↺ itération ${state.t} / ${LAST}`;
}

export function mount(goto) {
  build(goto);
  on('step', update);
  on('iteration', () => { count(); update(); });
  count();
  update();
}
