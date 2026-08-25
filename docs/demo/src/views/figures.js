// Les quatre figures ensemble, et l'agrandissement de l'une d'elles.
//
// Un clic, Entrée ou Espace sur une carte l'agrandit sur la zone des figures et
// de la liste ; la commande de fermeture ou Échap reviennent aux quatre. La
// figure que l'étape courante commente porte un en-tête plein.
//
// describe() ne sert plus qu'au nom accessible du canevas ; note(), quand une
// figure en déclare une, porte le paramètre que le tracé fixe.

import { STEPS } from '../content/steps.js';
import { FIGURES, figureFor } from '../figures/index.js';
import { palette } from '../figures/canevas.js';
import { on, state } from '../state.js';

const app = document.getElementById('app');
const plots = document.getElementById('plots');
const close = document.getElementById('plots-close');
const canvases = {};
const notes = {};

const step = () => STEPS[state.step];

function paintOne(key) {
  const target = canvases[key];
  const box = target.parentElement;
  const w = Math.round(box.clientWidth);
  const h = Math.round(box.clientHeight);
  if (w < 8 || h < 8) return;
  const figure = figureFor(key);

  if (figure.dom) {
    figure.render(target, palette(), state.t, { full: state.zoom === key, width: w - 6, height: h - 6 });
  } else {
    const ratio = window.devicePixelRatio || 1;
    target.width = Math.round(w * ratio);
    target.height = Math.round(h * ratio);
    const ctx = target.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    figure.draw(ctx, w, h, palette(), state.t);
  }

  target.setAttribute('aria-label', figure.describe(state.t));
  if (figure.note) notes[key].textContent = figure.note(state.t);
}

export function paint() {
  if (state.zoom) paintOne(state.zoom);
  else FIGURES.forEach((figure) => paintOne(figure.key));
}

export function follow() {
  const pointed = step().plot;
  document.querySelectorAll('.plot').forEach((card) => {
    card.classList.toggle('spot', card.dataset.plot === pointed);
  });
  paint();
}

export function zoom(key) {
  state.zoom = key;
  plots.classList.toggle('zoomed', key !== null);
  app.classList.toggle('zoomed', key !== null);
  close.hidden = key === null;
  document.querySelectorAll('.plot').forEach((card) => {
    const active = card.dataset.plot === key;
    card.classList.toggle('active', active);
    if (key === null) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Agrandir la figure ${figureFor(card.dataset.plot).label}`);
    } else {
      card.removeAttribute('tabindex');
      card.setAttribute('aria-label', figureFor(card.dataset.plot).label);
    }
  });
  requestAnimationFrame(paint);
}

export function mount() {
  document.querySelectorAll('[data-canvas]').forEach((element) => {
    canvases[element.dataset.canvas] = element;
  });
  document.querySelectorAll('.plot-note').forEach((element) => {
    notes[element.dataset.note] = element;
  });

  document.querySelectorAll('.plot').forEach((card) => {
    card.addEventListener('click', () => {
      if (state.zoom === null) zoom(card.dataset.plot);
    });
    card.addEventListener('keydown', (event) => {
      if (state.zoom !== null) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        zoom(card.dataset.plot);
      }
    });
  });

  close.addEventListener('click', () => zoom(null));

  new ResizeObserver(() => paint()).observe(plots);

  on('iteration', paint);
  on('step', follow);
}
