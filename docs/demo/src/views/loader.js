// Barre de chargement : une unité par étape du démarrage, le libellé de l'étape
// en cours et le pourcentage.
//
// Chaque étape rend la main au navigateur pendant une durée minimale : le
// calcul réel ne prend que quelques dizaines de millisecondes, et sans ce
// temps la barre ne serait qu'un éclair.

const root = document.getElementById('loader');
const fill = document.getElementById('loader-fill');
const stage = document.getElementById('loader-stage');
const percent = document.getElementById('loader-percent');

const MINIMUM = 45;

let done = 0;
let total = 1;

const pause = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export function start(count) {
  total = count;
}

export async function step(text) {
  done = Math.min(done + 1, total);
  const ratio = Math.round((done / total) * 100);
  stage.textContent = text;
  fill.style.width = `${ratio}%`;
  percent.textContent = `${ratio} %`;
  root.setAttribute('aria-valuenow', String(ratio));
  await pause(MINIMUM);
}

export async function finish() {
  document.body.classList.remove('booting');
  root.classList.add('is-done');
  await pause(500);
  root.remove();
}
