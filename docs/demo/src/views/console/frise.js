// Frise des dix-huit descentes, sous le curseur d'itération : six passages,
// chacun coupé en trois segments de maison de même largeur ; l'itération 0 au
// début d'un segment, l'arrêt à sa fin. Le curseur la parcourt d'un seul
// tenant : au-delà de l'arrêt d'une descente, on continue au début de la
// suivante.

import { FINAL, HOUSES, K, LAST, PLIS } from '../../dataset.js';
import { enterLoop, setIteration, setModel, shift } from '../../navigation.js';
import { state } from '../../state.js';
import { jump, stop } from './play.js';

const range = document.getElementById('iter');
const frise = document.getElementById('frise');

const H = HOUSES.length;
const lastOf = (pli, house) => PLIS[pli].models[house].last;
const name = (pli) => (pli === FINAL ? 'final' : String(pli + 1));

// Positions du curseur par segment : assez pour que chaque itération de la
// plus longue descente ait la sienne.
const R = Math.max(...PLIS.flatMap((pass) => pass.models.map((model) => model.last))) + 1;

const position = (pli, house, t) =>
  (pli * H + house) * R + Math.round((t / Math.max(lastOf(pli, house), 1)) * (R - 1));

function fromPosition(value) {
  const run = Math.min(Math.floor(value / R), PLIS.length * H - 1);
  const pli = Math.floor(run / H);
  const house = run % H;
  const last = lastOf(pli, house);
  return { pli, house, t: Math.min(Math.round(((value - run * R) / (R - 1)) * last), last) };
}

// Segments franchis pleins, segment courant rempli jusqu'à l'itération.
export function paint() {
  const current = state.pli * H + state.house;
  frise.querySelectorAll('.seg').forEach((segment, run) => {
    let fill = 0;
    if (run < current) fill = 1;
    if (run === current) fill = state.t / Math.max(LAST, 1);
    segment.classList.toggle('is-current', run === current);
    segment.querySelector('.seg-fill').style.width = `${fill * 100}%`;
  });
  frise.querySelectorAll('.pass').forEach((pass, pli) => pass.classList.toggle('is-current', pli === state.pli));

  range.value = position(state.pli, state.house, state.t);
  const pass = state.pli === FINAL ? 'modèle final' : `pli ${state.pli + 1} sur ${K}`;
  range.setAttribute('aria-valuetext', `${pass}, ${HOUSES[state.house]}, itération ${state.t} sur ${LAST}`);
}

export function mount() {
  PLIS.forEach((pass) => {
    const group = document.createElement('span');
    group.className = 'pass';
    group.innerHTML = `<span class="pass-label">${name(pass.pli)}</span>${pass.models.map((model, h) =>
      `<span class="seg h${h}${model.converged ? '' : ' limit'}"><span class="seg-fill"></span></span>`).join('')}`;
    frise.appendChild(group);
  });

  // Un glissement émet plus d'événements que l'écran ne peut en dessiner : seul
  // le dernier de chaque image est appliqué.
  let pending = null;
  range.max = PLIS.length * H * R - 1;
  range.addEventListener('input', () => {
    stop();
    if (pending === null) {
      requestAnimationFrame(() => {
        const { pli, house, t } = fromPosition(pending);
        pending = null;
        enterLoop();
        setModel(pli, house, t);
      });
    }
    pending = Number(range.value);
  });

  // Au clavier, un cran vaut une itération, quelle que soit la longueur du
  // segment ; Début et Fin restent dans la descente affichée.
  range.addEventListener('keydown', (event) => {
    const moves = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key in moves) jump(() => shift(moves[event.key]))();
    else if (event.key === 'Home') jump(() => setIteration(0))();
    else if (event.key === 'End') jump(() => setIteration(LAST))();
    else return;
    event.preventDefault();
  });
}
