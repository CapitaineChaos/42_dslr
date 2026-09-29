// État partagé et abonnements.
//
// Trois canaux, parce que les vues n'ont pas le même coût. Déplacer le curseur
// d'itération redessine les figures et les nombres ; retypographier la formule
// à chaque cran ferait ramer le glissement. Changer de modèle (passage ou
// maison) remplace toutes les données : les vues y recalculent ce qu'elles
// avaient figé.

export const state = {
  step: 0,
  t: 0,
  pli: 0,
  house: 0,
  zoom: null,
  pick: 0,
  pickTest: 0,
};

const channels = { step: [], iteration: [], model: [] };

export function on(channel, listener) {
  channels[channel].push(listener);
}

export function emit(channel) {
  channels[channel].forEach((listener) => listener());
}
