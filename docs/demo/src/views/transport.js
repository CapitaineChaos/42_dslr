// Commandes d'itération sous le schéma : compteur, sauts, curseur, lecture
// continue, et les trois mesures qui suivent la descente.

import { LAST, N, ROWS, TRACE, Y, at, wAt } from '../dataset.js';
import { confusion } from '../model.js';
import { setIteration } from '../navigation.js';
import { on, state } from '../state.js';

const output = document.getElementById('iteration');
const maximum = document.getElementById('iteration-max');
const jog = document.getElementById('jog');
const range = document.getElementById('iter');
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
const COST = Math.max(6, TRACE[0].cost.toFixed(4).length);
const WRONG = 2 * String(N).length + 1;

const pad = (text, width) => String(text).padStart(width);

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
  const matrix = confusion(ROWS, Y, weights);
  const wrong = matrix.fp + matrix.fn;

  output.textContent = pad(state.t, String(LAST).length);
  range.value = state.t;
  range.setAttribute('aria-valuetext', `itération ${state.t} sur ${LAST}`);

  readout.innerHTML = [
    ['perte J', pad(at(state.t).cost.toFixed(4), COST), ''],
    ['erreurs', pad(`${wrong}/${N}`, WRONG), wrong ? 'warn' : ''],
    ['exactitude', pad(`${(matrix.accuracy * 100).toFixed(1)} %`, 7), ''],
  ].map(([term, value, cls]) =>
    `<div><dt>${term}</dt><dd class="${cls}">${value}</dd></div>`).join('');
}

export function mount() {
  maximum.textContent = LAST;
  range.max = LAST;

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
