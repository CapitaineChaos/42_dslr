// Nœuds du schéma de parcours, dans l'ordre de la ligne. `phase` situe le
// nœud : 'intro' et 'amont' avant l'entraînement ; 'prep', 'maison', 'boucle'
// et 'post' dans l'entraînement, la boucle des maisons autour de la boucle de
// correction ; 'valid' sur la branche des plis ; 'aval' sur celle du modèle
// final.

export const NODES = [
  { key: 'presentation', phase: 'intro', label: 'Présentation', caption: 'objet · méthode' },
  { key: 'donnees', phase: 'amont', label: 'Données', caption: '5 plis' },
  { key: 'mediane', phase: 'prep', label: 'Médiane', caption: 'notes manquantes' },
  { key: 'echelle', phase: 'prep', label: 'Standardisation', caption: '(x − μ) / σ' },
  { key: 'maison', phase: 'maison', label: 'Maison', caption: 'un contre tous' },
  { key: 'score', phase: 'boucle', label: 'Score', caption: 'z = wᵀx' },
  { key: 'proba', phase: 'boucle', label: 'Probabilité', caption: 'p = σ(z)' },
  { key: 'perte', phase: 'boucle', label: 'Perte', caption: 'J' },
  { key: 'gradient', phase: 'boucle', label: 'Gradient', caption: '∇J' },
  { key: 'maj', phase: 'boucle', label: 'Mise à jour', caption: 'w − α∇J' },
  { key: 'decision', phase: 'post', label: 'Décision', caption: 'argmax z' },
  { key: 'validation', phase: 'valid', label: 'Validation', caption: 'plis 1 à 5' },
  { key: 'prediction', phase: 'aval', label: 'Prédiction', caption: 'modèle final' },
];
