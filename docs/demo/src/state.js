// État partagé et abonnements.
//
// Deux canaux, parce que les vues n'ont pas le même coût. Déplacer le curseur
// d'itération redessine les figures et les nombres ; retypographier la formule
// ou reconstruire le sommaire à chaque cran ferait ramer le glissement.

export const state = {
  step: 0,
  t: 0,
  zoom: null,
};

const channels = { step: [], iteration: [] };

export function on(channel, listener) {
  channels[channel].push(listener);
}

export function emit(channel) {
  channels[channel].forEach((listener) => listener());
}
