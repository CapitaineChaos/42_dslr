// Région d'annonce pour les lecteurs d'écran. Le message est retardé : pendant
// un glissement du curseur d'itération, une annonce par cran serait illisible.

const host = document.getElementById('live');
let timer = null;

export function say(text) {
  clearTimeout(timer);
  timer = setTimeout(() => { host.textContent = text; }, 400);
}
