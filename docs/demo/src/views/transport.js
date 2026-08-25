// Barre d'itération : compteur, sauts, curseur, lecture continue, métriques.

import { CONVERGED, LAST, N, ROWS, TRACE, Y, at, wAt } from '../dataset.js';
import { confusion, gradient, norm } from '../model.js';
import { setIteration } from '../navigation.js';
import { on, state } from '../state.js';

const output = document.getElementById('iteration');
const maximum = document.getElementById('iteration-max');
const jog = document.getElementById('jog');
const range = document.getElementById('iter');
const trackEnd = document.getElementById('track-end');
const readout = document.getElementById('readout');

// Douze secondes du premier au dernier pas, quel que soit le jeu : à cadence
// fixe, le micro-cas serait expédié et le scénario interminable.
const RATE = Math.max(1, Math.min(60, LAST / 12));

let playing = false;
let frame = null;
let previous = 0;
let carry = 0;

// Largeurs figées, en caractères, de chaque mesure : une valeur plus courte que
// la précédente décalerait tout ce qui la suit.
const COST = Math.max(8, TRACE[0].cost.toFixed(6).length);
const RATE_WIDTH = 'indéfinie'.length;
const CELLS = 4 * String(N).length + 3;

const pad = (text, width) => String(text).padStart(width);
const percent = (value) => pad(value === null ? 'indéfinie' : `${(value * 100).toFixed(1)} %`, RATE_WIDTH);

function playButton() {
  return jog.querySelector('[data-play]');
}

function stop() {
  playing = false;
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  const button = playButton();
  button.textContent = 'lecture';
  button.setAttribute('aria-pressed', 'false');
}

function tick(now) {
  const elapsed = Math.min((now - previous) / 1000, 0.25);
  previous = now;
  carry += elapsed * RATE;
  const steps = Math.floor(carry);
  if (steps >= 1) {
    carry -= steps;
    setIteration(state.t + steps);
  }
  if (state.t >= LAST) { stop(); return; }
  frame = requestAnimationFrame(tick);
}

function play() {
  if (playing) { stop(); return; }
  if (state.t >= LAST) setIteration(0);
  playing = true;
  carry = 0;
  previous = performance.now();
  const button = playButton();
  button.textContent = 'pause';
  button.setAttribute('aria-pressed', 'true');
  frame = requestAnimationFrame(tick);
}

function update() {
  const weights = wAt(state.t);
  const slope = gradient(ROWS, Y, weights);
  const matrix = confusion(ROWS, Y, weights);

  output.textContent = pad(state.t, String(LAST).length);
  range.value = state.t;
  range.setAttribute('aria-valuetext', `itération ${state.t} sur ${LAST}`);

  readout.innerHTML = [
    ['perte J', pad(at(state.t).cost.toFixed(6), COST), true],
    ['‖∇J‖', pad(norm(slope).toExponential(2), 8), false],
    ['exactitude', percent(matrix.accuracy), true],
    ['précision', percent(matrix.precision), false],
    ['rappel', percent(matrix.recall), false],
    ['VP/FP/FN/VN', pad(`${matrix.tp}/${matrix.fp}/${matrix.fn}/${matrix.tn}`, CELLS), false],
    ['arrêt', CONVERGED ? 'critère' : 'limite', false],
  ].map(([term, value, wide]) =>
    `<div><dt>${term}</dt><dd class="${wide ? 'wide' : ''}">${value}</dd></div>`).join('');
}

export function mount() {
  maximum.textContent = LAST;
  range.max = LAST;
  trackEnd.textContent = LAST;

  // Un saut manuel interrompt la lecture : reprendre la main sur l'itération et
  // voir le compteur continuer de défiler serait incompréhensible.
  const jump = (target) => () => { stop(); setIteration(target()); };

  const controls = [
    ['début', jump(() => 0)],
    ['-10', jump(() => state.t - 10)],
    ['-1', jump(() => state.t - 1)],
    ['lecture', play, 'play'],
    ['+1', jump(() => state.t + 1)],
    ['+10', jump(() => state.t + 10)],
    ['fin', jump(() => LAST)],
  ];

  controls.forEach(([label, action, role]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button';
    button.textContent = label;
    if (role === 'play') {
      button.dataset.play = '';
      button.setAttribute('aria-pressed', 'false');
    }
    button.addEventListener('click', action);
    jog.appendChild(button);
  });

  range.addEventListener('input', (event) => {
    stop();
    setIteration(parseInt(event.target.value, 10));
  });

  on('iteration', update);
  update();
}

export { play as togglePlay };
