// La suite des couples (w₁, w₂) posée sur le relief de J, avec les lignes de
// niveau projetées au sol.
//
// Le relief est une section de J. w₀ y est fixé à sa valeur de l'itération
// courante, sans quoi J ne pourrait pas être tracé au-dessus d'un plan. La
// trajectoire est évaluée dans cette même section, donc elle repose sur la
// nappe. Les pertes de la figure « Perte » gardent le w₀ de chaque pas.

import { HOUSE, LAST, PLI, ROWS, TRACE, W1, W2, Y, wAt } from '../dataset.js';
import { cost } from '../model.js';
import { scene } from './scene.js';

const M = 32;  // au-delà, le relief ne gagne rien et le cran de lecture s'alourdit

let cache = null;

// Les coefficients parcourus mènent J jusqu'à quelques unités, alors que la
// descente se déroule entre 0,69 et 0,40. À échelle libre, les pentes
// lointaines occupent toute la boîte et la cuvette se réduit à un pli au fond.
// Le relief garde donc ses valeurs, mais l'axe s'arrête à ce plafond et la
// nappe est coupée à l'affichage. L'en-tête de la carte donne cette hauteur.
export const CEILING = 1.5 * Math.log(2);

const steps = (range) => Array.from(
  { length: M + 1 },
  (_, i) => range[0] + ((range[1] - range[0]) * i) / M,
);

// Le relief ne se recalcule que si w₀ a bougé assez pour déplacer les niveaux,
// ou si le modèle a changé.
function relief(w0) {
  const key = `${PLI}:${HOUSE}:${Math.round(w0 * 12)}`;
  if (cache && cache.key === key) return cache;
  const xs = steps(W1);
  const ys = steps(W2);
  const z = ys.map((w2) => xs.map((w1) => cost(ROWS, Y, [w0, w1, w2])));
  cache = { key, xs, ys, z, floor: Math.min(...z.map((line) => Math.min(...line))) };
  return cache;
}

function nappe(field, p, full) {
  return {
    type: 'surface',
    name: 'J',
    x: field.xs,
    y: field.ys,
    z: field.z,
    // L'échelle va du blanc de la vallée au gris des crêtes. La trajectoire,
    // tracée en noir, ne passe donc jamais sur les tons sombres du relief.
    colorscale: [[0, p.surface], [0.3, p.sunk], [1, p.edge]],
    cmin: field.floor,
    cmax: CEILING,
    showscale: full,
    colorbar: { title: { text: 'J' }, thickness: 10, len: 0.6, outlinewidth: 0 },
    opacity: 1,
    contours: {
      z: {
        show: true,
        start: 0,
        end: CEILING,
        size: CEILING / 12,
        color: p.edge,
        width: 1,
        highlight: false,
        // Projection au sol des lignes de niveau, que la figure montrait à
        // plat avant d'être en relief.
        project: { z: true },
      },
    },
    hovertemplate: 'w₁ %{x:.2f}<br>w₂ %{y:.2f}<br>J = %{z:.4f}<extra></extra>',
  };
}

export const chemin = {
  key: 'chemin',
  label: 'Trajectoire',
  dom: true,

  render(element, p, t, box) {
    const w0 = wAt(t)[0];
    const field = relief(w0);
    const at = (i) => {
      const [, w1, w2] = TRACE[i].weights;
      return [w1, w2, cost(ROWS, Y, [w0, w1, w2])];
    };
    const walked = Array.from({ length: Math.min(t, LAST) + 1 }, (_, i) => at(i));
    const here = at(Math.min(t, LAST));
    const end = at(LAST);

    const data = [
      nappe(field, p, box.full),
      {
        type: 'scatter3d',
        mode: 'lines',
        name: 'trajectoire',
        x: walked.map((point) => point[0]),
        y: walked.map((point) => point[1]),
        z: walked.map((point) => point[2]),
        line: { color: p.trace },
        meta: { base: { width: 6 } },
        hovertemplate: 'w₁ %{x:.2f}<br>w₂ %{y:.2f}<br>J = %{z:.4f}<extra></extra>',
      },
      {
        type: 'scatter3d',
        mode: 'markers',
        name: 'itération courante',
        x: [here[0]],
        y: [here[1]],
        z: [here[2]],
        marker: { color: p.trace },
        meta: { base: { size: 5 } },
        hovertemplate: 'w₁ %{x:.2f}<br>w₂ %{y:.2f}<br>J = %{z:.4f}<extra></extra>',
      },
      {
        type: 'scatter3d',
        mode: 'markers',
        name: 'arrêt',
        x: [end[0]],
        y: [end[1]],
        z: [end[2]],
        marker: { color: p.inkSoft, symbol: 'cross' },
        meta: { base: { size: 7 } },
        hoverinfo: 'skip',
      },
    ];

    const axes = [
      { title: 'w₁', range: W1 },
      { title: 'w₂', range: W2 },
      { title: 'J', range: [0, CEILING] },
    ];
    scene(element, 'chemin', data, axes, p, { ...box, rise: 0.7 });
  },

  describe(t) {
    return `Trajectoire des couples (w₁, w₂) jusqu'à l'itération ${t}, sur le relief de J.`;
  },

  // La section qui fixe le relief et la hauteur qui l'écrête sont écrites dans
  // l'en-tête, car ni l'une ni l'autre ne se lisent sur la figure.
  note: (t) => `w₀ = ${wAt(t)[0].toFixed(3)} fixé, J écrêté à ${CEILING.toFixed(2)}`,
};
