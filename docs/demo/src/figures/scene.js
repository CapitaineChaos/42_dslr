// Socle commun aux figures en relief, confiées à Plotly (bundle gl3d de
// vendor/) : mise en page, jetons de couleur, mémoire de l'orientation.
//
// Le premier appel construit la scène, les suivants la mettent à jour. react
// garde le contexte WebGL et l'orientation, alors que newPlot les recréerait à
// chaque itération.

const cameras = {};
const reference = {};
const applied = {};
const last = {};
const built = new Set();

const START = { eye: { x: -1.65, y: -1.5, z: 0.85 } };

// Points et traits se comptent en pixels. Sans correction, ils gardent leur
// taille pendant que la scène grossit, et les disques d'un nuage rapproché se
// recouvrent. La taille suit donc la distance de l'œil, rapportée à celle du
// premier tracé. Cette distance est la seule connue pour valoir l'échelle
// nominale, les conventions de la bibliothèque n'étant pas accessibles.
// La position réelle de l'œil est lue sur la scène. La mise en page garde la
// valeur du dernier tracé et ignore les gestes.
function live(element) {
  const scene3d = element._fullLayout && element._fullLayout.scene;
  const view = scene3d && scene3d._scene && scene3d._scene.getCamera ? scene3d._scene.getCamera() : null;
  return view && view.eye ? view : null;
}

function distance(element) {
  const view = live(element);
  const scene3d = element._fullLayout && element._fullLayout.scene;
  const eye = (view && view.eye) || (scene3d && scene3d.camera && scene3d.camera.eye);
  return eye ? Math.hypot(eye.x, eye.y, eye.z) : null;
}

function factor(element, key) {
  const now = distance(element);
  if (!now) return 1;
  if (!reference[key]) reference[key] = now;
  return Math.min(2.6, Math.max(0.45, reference[key] / now));
}

// Les tailles de référence sont déclarées par la figure dans meta.base.
function sized(data, element, key) {
  const k = factor(element, key);
  return data.map((trace) => {
    const base = trace.meta && trace.meta.base;
    if (!base) return trace;
    const out = { ...trace };
    if (base.size) out.marker = { ...trace.marker, size: base.size * k };
    if (base.width) out.line = { ...trace.line, width: base.width * k };
    return out;
  });
}

// Après une orbite ou un zoom, seules ces tailles changent, donc un restyle
// suffit. Un react retracerait toute la nappe à chaque image du glissement.
function rescale(Plotly, element, key) {
  const k = factor(element, key);
  if (applied[key] && Math.abs(k - applied[key]) < 0.04 * applied[key]) return;
  applied[key] = k;
  const data = last[key] || [];
  const dots = [];
  const lines = [];
  data.forEach((trace, index) => {
    const base = trace.meta && trace.meta.base;
    if (!base) return;
    if (base.size) dots.push([index, base.size * k]);
    if (base.width) lines.push([index, base.width * k]);
  });
  if (dots.length) {
    Plotly.restyle(element, { 'marker.size': dots.map(([, size]) => size) }, dots.map(([index]) => index));
  }
  if (lines.length) {
    Plotly.restyle(element, { 'line.width': lines.map(([, width]) => width) }, lines.map(([index]) => index));
  }
}

export function scene(element, key, data, axes, p, { full, width, height, rise = 1 }) {
  const Plotly = window.Plotly;
  if (!Plotly) return;
  last[key] = data;

  const face = { family: p.family, size: full ? 12 : 10, color: p.inkSoft };
  const axis = ({ title, range, tickvals }) => ({
    title: { text: full ? title : '' },
    range,
    tickvals,
    nticks: 6,
    showticklabels: full,
    tickfont: face,
    gridcolor: p.grid,
    zerolinecolor: p.edge,
    linecolor: p.edge,
    backgroundcolor: p.surface,
    showbackground: true,
    // Les traits qui suivent le curseur sur les trois faces sont désactivés.
    // Ils sautent d'une face à l'autre au moindre mouvement et se confondent
    // avec des repères.
    showspikes: false,
  });

  const layout = {
    width,
    height,
    margin: { l: 0, r: 0, t: 0, b: 0 },
    paper_bgcolor: p.surface,
    font: face,
    separators: ',.',
    showlegend: full,
    legend: {
      orientation: 'h', y: 0.02, x: 0.5, xanchor: 'center', font: face, bgcolor: 'rgba(0,0,0,0)',
    },
    scene: {
      xaxis: axis(axes[0]),
      yaxis: axis(axes[1]),
      zaxis: axis(axes[2]),
      // La hauteur porte une autre grandeur que les deux longueurs du plan, et
      // un cube lui donnerait trop de hauteur.
      aspectmode: 'manual',
      aspectratio: { x: 1, y: 1, z: rise },
      camera: cameras[key] || START,
    },
  };

  if (built.has(key)) {
    Plotly.react(element, sized(data, element, key), layout);
    return;
  }
  built.add(key);
  Plotly.newPlot(element, sized(data, element, key), layout, {
    displaylogo: false,
    responsive: false,
    scrollZoom: true,
    modeBarButtonsToRemove: ['tableRotation', 'resetCameraLastSave3d'],
  });

  // L'orbite se termine par un relayout. Le zoom à la molette n'en émet aucun
  // tant que la roue tourne.
  //
  // Le geste est recopié dans la mise en page avant tout restyle. Sans cela, le
  // tracé suivant repartirait de l'orientation enregistrée dans la mise en
  // page, et la scène reviendrait à sa position de départ au relâchement de la
  // souris.
  let pending = null;
  const watch = () => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      const view = live(element);
      if (view) {
        cameras[key] = view;
        if (element.layout && element.layout.scene) element.layout.scene.camera = view;
      }
      rescale(Plotly, element, key);
    }, 120);
  };
  element.on('plotly_relayout', watch);
  element.addEventListener('wheel', watch, { passive: true });
}
