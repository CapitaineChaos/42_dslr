// Démarrage : écran de chargement, bibliothèques, calcul des six passages,
// puis montage des vues. La page n'apparaît qu'une fois tout prêt : figures
// dessinées et première formule écrite.

import { FINAL, HOUSES, K, compute } from './dataset.js';
import * as loader from './views/loader.js';

const passage = (pli) => (pli === FINAL ? 'modèle final' : `pli ${pli + 1} sur ${K}`);

const LABELS = {
  prep: ({ pli }) => `préparation des notes · ${passage(pli)}`,
  descent: ({ pli, house }) => `descente de gradient · ${passage(pli)} · ${HOUSES[house]}`,
  validation: () => 'validation croisée',
};

// Bibliothèques, puis pour chaque passage la préparation et une descente par
// maison, le bilan, les vues, les formules.
loader.start(1 + (K + 1) * (1 + HOUSES.length) + 3);

if (window.MathJax && window.MathJax.startup) await window.MathJax.startup.promise;
await document.fonts.ready;
await loader.step('bibliothèques');

await compute((event) => loader.step(LABELS[event.kind](event)));

const app = await import('./app.js');
await loader.step('vues et figures');
await app.ready();
await loader.step('formules');

await loader.finish();
