// Écran de démarrage : les options du cours et Démarrer, actif une fois le
// calcul terminé. Les options sont recopiées dans config.js à Démarrer.

import { OPTIONS, config } from '../config.js';

const form = document.getElementById('config');
const list = document.getElementById('options');
const go = document.getElementById('start');

export function mount() {
  list.innerHTML = OPTIONS.map(({ key, label, value }) => `
    <label class="option">
      <input type="checkbox" role="switch" name="${key}"${value ? ' checked' : ''}>
      <span class="option-label">${label}</span>
    </label>`).join('');
}

export function ready() {
  go.disabled = false;
}

export function chosen() {
  return new Promise((resolve) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      OPTIONS.forEach(({ key }) => { config[key] = form.elements[key].checked; });
      go.disabled = true;
      resolve();
    }, { once: true });
  });
}
