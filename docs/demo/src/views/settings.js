// Standardisation et effectif. La case recharge la page : la trace, le relief
// et les bornes des figures dépendent toutes du choix.

import { ALPHA, N, RAW, TEST, urlFor } from '../dataset.js';

export function mount() {
  const raw = document.getElementById('raw');
  raw.checked = RAW;
  raw.addEventListener('change', () => { location.search = urlFor(raw.checked); });

  document.getElementById('scale').textContent = `apprentissage ${N}, évaluation ${TEST.length}, α = ${ALPHA}`;
  document.body.classList.toggle('raw-mode', RAW);
}
