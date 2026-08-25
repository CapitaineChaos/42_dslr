// Ateliers attachés à une micro-étape par son champ `widget`. Leur état est
// indépendant de l'itération : on y manipule une valeur, pas la descente.

import { sigmoid, softplus } from '../model.js';

const naiveSigmoid = (z) => 1 / (1 + Math.exp(-z));
const naiveSoftplus = (z) => Math.log(1 + Math.exp(z));

function show(value) {
  if (Number.isNaN(value)) return '<span class="broken">NaN</span>';
  if (!Number.isFinite(value)) return `<span class="broken">${value > 0 ? 'Infinity' : '-Infinity'}</span>`;
  if (value !== 0 && Math.abs(value) < 1e-4) return value.toExponential(3);
  return value.toFixed(6);
}

export const LABS = {
  // Le débordement se constate : à partir de |z| ≈ 710, exp() dépasse ce qu'un
  // flottant double peut représenter.
  overflow(host) {
    host.innerHTML = `
      <div class="lab">
        <div class="lab-head">
          <h3>Débordement</h3>
          <output id="lab-z" for="lab-range"></output>
        </div>
        <label class="visually-hidden" for="lab-range">Score z</label>
        <input type="range" id="lab-range" min="-1400" max="1400" step="1" value="-750">
        <table>
          <thead><tr><th>expression</th><th>écriture directe</th><th>écriture stable</th></tr></thead>
          <tbody id="lab-body"></tbody>
        </table>
        <p class="lab-note" id="lab-note"></p>
      </div>`;

    const slider = host.querySelector('#lab-range');
    const body = host.querySelector('#lab-body');
    const readout = host.querySelector('#lab-z');
    const note = host.querySelector('#lab-note');

    const draw = () => {
      const z = parseInt(slider.value, 10);
      const naive = { s: naiveSigmoid(z), sp: naiveSoftplus(z) };
      const stable = { s: sigmoid(z), sp: softplus(z) };
      const rows = [
        ['exp(-z)', Math.exp(-z), null],
        ['σ(z)', naive.s, stable.s],
        ['ln(1+e^z)', naive.sp, stable.sp],
        ['ℓ pour y = 1', -Math.log(naive.s), stable.sp - z],
      ];

      body.innerHTML = rows.map(([label, wrong, right]) => {
        const cell = right === null ? '<td class="void"></td>' : `<td>${show(right)}</td>`;
        return `<tr><td>${label}</td><td>${show(wrong)}</td>${cell}</tr>`;
      }).join('');
      readout.textContent = `z = ${z}`;
      slider.setAttribute('aria-valuetext', `z égale ${z}`);

      const broken = !Number.isFinite(naive.sp) || !Number.isFinite(-Math.log(naive.s)) || naive.s === 0;
      note.innerHTML = broken
        ? `<code>exp</code> dépasse la borne du flottant double. En JavaScript le résultat vaut <b>Infinity</b> et la perte cesse d'être un nombre ; en Python, <code>pow(E, -x)</code> lève <code>OverflowError</code>. L'écriture stable reste définie.`
        : `Les deux écritures coïncident pour <code>|z| &lt; 709,78</code>.`;
    };

    slider.addEventListener('input', draw);
    draw();
  },
};
