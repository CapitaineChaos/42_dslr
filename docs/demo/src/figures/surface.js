// La nappe des probabilités au-dessus du plan des notes, la ligne p = 1/2 et
// les élèves posés au sol.
//
// Le tracé est confié à Plotly : voir scene.js pour ce que les deux figures en
// relief partagent.

import { AX, AY, COURSES, FEATURES, ROWS, STATS, TRAIN, Y, wAt } from '../dataset.js';
import { score, sigmoid } from '../model.js';
import { scene } from './scene.js';

const M = 32;  // au-delà, le relief ne gagne rien et le cran de lecture s'alourdit

const steps = (range) => Array.from(
  { length: M + 1 },
  (_, i) => range[0] + ((range[1] - range[0]) * i) / M,
);

function houses(p) {
  const groups = [[1, 'Gryffondor', p.houseA, 'square'], [0, 'Serpentard', p.houseB, 'circle']];
  return groups.map(([label, name, color, symbol]) => {
    const members = TRAIN.filter((student, i) => Y[i] === label);
    return {
      type: 'scatter3d',
      mode: 'markers',
      name,
      x: members.map((student) => FEATURES(student)[0]),
      y: members.map((student) => FEATURES(student)[1]),
      z: members.map(() => 0),
      text: members.map((student) => student.name),
      hovertemplate: `%{text}<br>${STATS[COURSES[0]].label} %{x:.2f}<br>${STATS[COURSES[1]].label} %{y:.2f}<extra></extra>`,
      marker: { symbol, color, line: { width: 0 } },
      meta: { base: { size: 4 } },
    };
  });
}

// Trace de la droite p = 1/2 sur la nappe : w₁x + w₂y + w₀ = 0.
function half(weights, p) {
  if (Math.abs(weights[2]) < 1e-9) return [];
  const points = steps(AX)
    .map((x) => [x, -(weights[0] + weights[1] * x) / weights[2]])
    .filter(([, y]) => y >= AY[0] && y <= AY[1]);
  if (points.length < 2) return [];
  return [{
    type: 'scatter3d',
    mode: 'lines',
    name: 'p = 0,5',
    x: points.map(([x]) => x),
    y: points.map(([, y]) => y),
    z: points.map(() => 0.5),
    hoverinfo: 'skip',
    line: { color: p.trace },
    meta: { base: { width: 5 } },
  }];
}

function nappe(weights, p, full) {
  const xs = steps(AX);
  const ys = steps(AY);
  return {
    type: 'surface',
    name: 'p(x)',
    x: xs,
    y: ys,
    z: ys.map((y) => xs.map((x) => sigmoid(weights[0] + weights[1] * x + weights[2] * y))),
    cmin: 0,
    cmax: 1,
    // Un gris franc au milieu plutôt que le blanc du fond : sans lui, la nappe
    // s'efface là où elle vaut 1/2, c'est-à-dire tout entière au départ de la
    // descente.
    colorscale: [[0, p.houseB], [0.5, p.line], [1, p.houseA]],
    opacity: 0.92,
    showscale: full,
    colorbar: { title: { text: 'p' }, thickness: 10, len: 0.6, outlinewidth: 0, tickvals: [0, 0.25, 0.5, 0.75, 1] },
    // Les lignes de niveau tous les dixièmes de probabilité. Un quadrillage en
    // plus, le long de x et de y, brouillait la nappe de croisillons.
    contours: {
      z: { show: true, start: 0.1, end: 0.9, size: 0.1, color: p.edge, width: 1, highlight: false },
    },
    hovertemplate: `${STATS[COURSES[0]].label} %{x:.2f}<br>${STATS[COURSES[1]].label} %{y:.2f}<br>p = %{z:.3f}<extra></extra>`,
  };
}

export const surface = {
  key: 'surface',
  label: 'p(x)',
  dom: true,

  render(element, p, t, box) {
    const weights = wAt(t);
    const axes = [
      { title: STATS[COURSES[0]].label, range: AX },
      { title: STATS[COURSES[1]].label, range: AY },
      { title: 'p', range: [0, 1], tickvals: [0, 0.5, 1] },
    ];
    const data = [nappe(weights, p, box.full), ...half(weights, p), ...houses(p)];
    // La probabilité tient dans [0, 1] : à hauteur égale au plan des notes, la
    // nappe se dresse comme une falaise.
    scene(element, 'surface', data, axes, p, { ...box, rise: 0.55 });
  },

  describe(t) {
    if (t === 0) return 'Surface de probabilité, itération 0 : plan horizontal à p = 0,5.';
    const probabilities = ROWS.map((row) => sigmoid(score(wAt(t), row)));
    return `Surface de probabilité à l'itération ${t}, ligne de niveau p = 0,5 tracée dessus ; p de ${Math.min(...probabilities).toFixed(3)} à ${Math.max(...probabilities).toFixed(3)}.`;
  },
};
