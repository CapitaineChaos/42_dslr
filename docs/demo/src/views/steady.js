// Hauteur réservée. Un bloc dont le contenu dépend de l'itération est rendu,
// au changement d'étape ou de passage, pour quelques itérations témoins ; il
// garde ensuite la plus grande de ces hauteurs. Quand l'itération change, il ne
// rétrécit ni ne grandit, et rien ne bouge sous lui.
//
// Les témoins : le départ, où plusieurs textes changent de forme, le premier
// pas, le milieu et la fin de la descente du passage affiché.

import { LAST } from '../dataset.js';

export function reserve(element, draw, current) {
  const samples = [...new Set([0, 1, Math.round(LAST / 2), LAST])];
  element.style.minHeight = '';
  let tallest = 0;
  samples.forEach((t) => {
    draw(t);
    tallest = Math.max(tallest, element.getBoundingClientRect().height);
  });
  draw(current);
  element.style.minHeight = `${Math.ceil(tallest)}px`;
}
