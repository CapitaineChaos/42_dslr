// Dessin du schéma : placement des nœuds, flèches, pastilles. Une ligne de
// nœuds de la présentation à la décision, puis l'embranchement vers la
// validation, en haut, et la prédiction, en bas. Les flèches de retour des
// trois boucles : sous la ligne, de la mise à jour au score, puis de l'arrêt à
// la maison ; au-dessus, de la validation à la médiane.

import { NODES, STEPS } from '../../content/steps.js';

const host = document.getElementById('flow');
const NS = 'http://www.w3.org/2000/svg';

const W = 116;
const H = 70;
const GAP = 20;
const EXIT = 48;
const FORK = 22;
const BRANCH = 28;
const LANE_Y = 10;
const UPPER_Y = 26;
const NODE_Y = 70;
const LOWER_Y = 114;
const RETURN_Y = NODE_Y + H + 18;
const HOUSE_Y = RETURN_Y + 18;
const HEIGHT = LOWER_Y + H + 8;

export const INSIDE = ['prep', 'maison', 'boucle', 'post'];

export const nodes = {};
export const pips = [];
export const edges = [];

function el(name, attributes = {}, parent = null) {
  const element = document.createElementNS(NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (parent) parent.appendChild(element);
  return element;
}

function layout() {
  const place = {};
  const row = NODES.filter((node) => node.phase !== 'valid' && node.phase !== 'aval');
  let x = 8;
  row.forEach((node, i) => {
    if (i > 0) x += row[i - 1].phase === 'boucle' && node.phase === 'post' ? EXIT : GAP;
    place[node.key] = { x, y: NODE_Y };
    x += W;
  });
  const forkX = x + FORK;
  const branchX = forkX + BRANCH;
  NODES.filter((node) => node.phase === 'valid').forEach((node) => { place[node.key] = { x: branchX, y: UPPER_Y }; });
  NODES.filter((node) => node.phase === 'aval').forEach((node) => { place[node.key] = { x: branchX, y: LOWER_Y }; });
  return { place, row, forkX, width: branchX + W + 8 };
}

function arrowMarker(defs, id) {
  const marker = el('marker', {
    id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7,
    orient: 'auto-start-reverse',
  }, defs);
  el('path', { d: 'M 0 1 L 9 5 L 0 9 z', class: `arrow-head ${id}` }, marker);
}

function edge(svg, d, to, kind = 'forward') {
  const path = el('path', { d, class: `edge edge-${kind}`, 'marker-end': 'url(#arrow)' }, svg);
  edges.push({ path, to, kind });
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
      const hit = el('circle', { cx: first + rank * spacing, cy: at.y + H - 12, r: 8, class: 'pip-hit' }, group);
      el('title', {}, hit).textContent = STEPS[index].title;
      hit.addEventListener('click', (event) => { event.stopPropagation(); goto(index); });
      pips.push({ pip, index });
    });
  }

  nodes[node.key] = group;
}

export function build(goto) {
  const { place, row, forkX, width } = layout();
  const svg = el('svg', { viewBox: `0 0 ${width} ${HEIGHT}`, class: 'flow-svg', role: 'group', 'aria-label': 'Parcours' });

  const defs = el('defs', {}, svg);
  arrowMarker(defs, 'arrow');
  arrowMarker(defs, 'arrow-on');
  const glow = el('filter', { id: 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
  el('feGaussianBlur', { stdDeviation: 5, result: 'blur' }, glow);
  const merge = el('feMerge', {}, glow);
  el('feMergeNode', { in: 'blur' }, merge);
  el('feMergeNode', { in: 'SourceGraphic' }, merge);

  const middle = NODE_Y + H / 2;
  for (let i = 0; i < row.length - 1; i += 1) {
    const from = row[i];
    const to = row[i + 1];
    const x1 = place[from.key].x + W;
    const x2 = place[to.key].x;
    edge(svg, `M ${x1} ${middle} L ${x2 - 2} ${middle}`, to.key);
    if (from.phase === 'boucle' && to.phase === 'post') {
      el('text', { x: (x1 + x2) / 2, y: middle - 10, class: 'edge-label' }, svg).textContent = 'arrêt';
    }
  }

  const last = place[row[row.length - 1].key];
  NODES.filter((node) => node.phase === 'valid' || node.phase === 'aval').forEach((node) => {
    const target = place[node.key];
    edge(svg, `M ${last.x + W} ${middle} H ${forkX} V ${target.y + H / 2} H ${target.x - 2}`, node.key);
  });

  const loop = row.filter((node) => node.phase === 'boucle');
  const head = place[loop[0].key];
  const tail = place[loop[loop.length - 1].key];
  edge(svg, `M ${tail.x + W / 2} ${tail.y + H} V ${RETURN_Y} H ${head.x + W / 2} V ${head.y + H + 2}`, loop[0].key, 'return');

  // Boucle des maisons : de la sortie « arrêt » au nœud des étiquettes.
  const maison = row.find((node) => node.phase === 'maison');
  const exitX = tail.x + W + EXIT / 2;
  edge(svg, `M ${exitX} ${middle} V ${HOUSE_Y} H ${place[maison.key].x + W / 2} V ${NODE_Y + H + 2}`, maison.key, 'house-return');

  const start = row.find((node) => INSIDE.includes(node.phase));
  const valid = place[NODES.find((node) => node.phase === 'valid').key];
  edge(svg, `M ${valid.x + W / 2} ${valid.y} V ${LANE_Y} H ${place[start.key].x + W / 2} V ${NODE_Y - 2}`, start.key, 'outer-return');

  NODES.forEach((node) => nodeGroup(svg, node, place[node.key], goto));
  host.appendChild(svg);
}
