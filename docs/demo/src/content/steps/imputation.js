import { plural, spec } from './format.js';

export default {
  id: 'imputation',
  node: 'mediane',
  phase: 'prep',
  plot: 'frontiere',
  title: 'Imputation par la médiane',
  math: 'x_{ij} \\leftarrow \\begin{cases} x_{ij} & \\text{si la note est présente} \\\\ m_j & \\text{si la note est absente} \\end{cases}',
  calc: { group: 'train', cols: ['name', 'house', 'raw0', 'raw1'], worked: 'impute' },
  lead: (c) => spec([
    ['Notation', `x<sub>ij</sub> est la note de l'élève i dans la matière j, et m<sub>j</sub>
      la médiane des notes présentes de cette matière.`],
    ['Notes absentes', c.missing.length
      ? `${c.missing.map((m) => `${m.name} n'a pas de note de ${m.label}`).join(', et ')}.`
      : `Aucune note ne manque parmi ${c.trainers}. Les élèves dont une note est absente
         sont dans le pli mis de côté.`],
    ['Médiane', `Sur ${c.trainers}, la médiane vaut ${c.median0} en ${c.label0} et
      ${c.median1} en ${c.label1}.`],
    ['Robustesse', `La médiane ne dépend que du rang des valeurs. Une note extrême la décale
      d'un rang au plus, alors qu'elle déplace la moyenne en proportion de son écart.`],
    ['Ordre', 'L\'imputation précède la standardisation, donc μ et σ sont calculés sur les colonnes complétées.'],
  ]),
  more: (c) => `
    <p>L'imputation conserve la médiane de la colonne et réduit son écart type, car la valeur
    ajoutée est au centre.${c.missing.length ? ` Avec ${c.missing.length}
    ${plural(c.missing.length, 'valeur imputée', 'valeurs imputées')} sur ${c.n * 2}, l'effet
    sur σ est négligeable.` : ''}</p>`,
};
