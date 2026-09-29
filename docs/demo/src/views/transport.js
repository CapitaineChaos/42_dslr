// Console, hors commandes d'étape (nav.js) : paramètres et mesures
// (console/readout.js), sélecteurs de passage et de maison
// (console/choosers.js), lecture et sauts (console/play.js), frise
// (console/frise.js).
//
// Les commandes restent actives partout. Hors de l'entraînement, où l'étape
// fixe le modèle et l'itération, toucher à la frise, aux sauts, à la lecture ou
// à la maison ramène dans la boucle de correction, au point choisi.

import { inFrame } from '../navigation.js';
import { on, state } from '../state.js';
import * as choosers from './console/choosers.js';
import * as frise from './console/frise.js';
import * as play from './console/play.js';
import * as readout from './console/readout.js';

export function mount() {
  play.mount();
  choosers.mount();
  frise.mount();

  on('iteration', () => { readout.paint(); frise.paint(); });
  on('model', () => { readout.paintParams(); choosers.paint(); });
  on('step', () => {
    if (!inFrame(state.step)) play.stop();
    choosers.paint();
  });

  readout.paintParams();
  choosers.paint();
  readout.paint();
  frise.paint();
}

export const { togglePlay } = play;
