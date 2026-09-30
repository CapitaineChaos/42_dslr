export const EVALUATION = {
  'matrice-confusion': {
    title: 'Matrice de confusion',
    short: 'Tableau qui croise la classe réelle et la classe attribuée.',
    body: String.raw`
      <p>La matrice de confusion compte les décisions d'un classifieur. La ligne \(r\)
      correspond à la classe réelle, la colonne \(a\) à la classe attribuée, et la case
      \((r, a)\) contient le nombre d'observations de classe \(r\) classées \(a\). La diagonale
      contient les décisions correctes.</p>
      <p>La [[precision|précision]] d'une classe se lit sur sa colonne, son [[rappel]] sur sa
      ligne, et l'[[exactitude]] sur la diagonale entière. Pour un modèle binaire, les quatre
      cases sont les [[positifs|vrais et faux positifs et négatifs]]. La
      [[roc|courbe ROC]] fait varier le seuil de décision et suit l'évolution de ces
      cases.</p>`,
  },
  positifs: {
    title: 'Vrais et faux positifs',
    short: 'VP, FP, FN, VN : les quatre cas d\'une décision binaire.',
    body: String.raw`
      <p>Pour le modèle d'une maison, chaque élève tombe dans l'un de quatre cas. Un vrai
      positif (VP) est un élève de la maison classé dans la maison. Un faux positif (FP) est un
      élève d'une autre maison classé dans la maison. Un faux négatif (FN) est un élève de la
      maison classé ailleurs. Un vrai négatif (VN) est un élève d'une autre maison classé
      ailleurs.</p>
      <p>La [[precision|précision]] vaut \(\mathrm{VP} / (\mathrm{VP} + \mathrm{FP})\), le
      [[rappel]] \(\mathrm{VP} / (\mathrm{VP} + \mathrm{FN})\).</p>`,
  },
  exactitude: {
    title: 'Exactitude',
    short: 'Part des observations bien classées.',
    body: String.raw`
      <p>L'exactitude est la part des décisions correctes :</p>
      \[ \text{exactitude} = \frac{\text{observations bien classées}}{\text{observations}}. \]
      <p>Elle ne distingue pas les classes. Si 90 % des élèves sont d'une même maison, un
      modèle qui répond toujours cette maison atteint 90 % d'exactitude sans rien avoir appris.
      La [[precision|précision]] et le [[rappel]] par classe révèlent ce cas.</p>`,
  },
  precision: {
    title: 'Précision',
    short: 'Part des observations classées dans une classe qui en font vraiment partie.',
    body: String.raw`
      <p>La précision de la classe \(h\) est</p>
      \[ P_h = \frac{\text{bien classés en } h}{\text{classés en } h}. \]
      <p>Une précision de 1 signifie qu'aucun élève n'est placé à tort dans \(h\). Quand le
      modèle ne classe personne dans \(h\), la précision vaut \(0/0\) et n'est pas
      définie.</p>`,
  },
  rappel: {
    title: 'Rappel',
    short: 'Part des observations d\'une classe que le modèle retrouve.',
    body: String.raw`
      <p>Le rappel de la classe \(h\) est</p>
      \[ R_h = \frac{\text{bien classés en } h}{\text{élèves de } h}. \]
      <p>Un rappel de 1 signifie que tous les élèves de \(h\) sont retrouvés. Précision et
      rappel s'opposent souvent. Classer davantage d'élèves dans \(h\) augmente le rappel et
      peut faire baisser la [[precision|précision]].</p>`,
  },
  f1: {
    title: 'F1',
    short: 'Moyenne harmonique de la précision et du rappel : 2PR / (P + R).',
    body: String.raw`
      <p>Le score F1 résume la précision \(P\) et le rappel \(R\) d'une classe par leur
      [[moyenne-harmonique|moyenne harmonique]] :</p>
      \[ F_1 = \frac{2PR}{P + R}. \]
      <p>Il vaut 1 seulement si \(P = R = 1\), et reste proche de la plus petite des deux
      valeurs. dslr compte F1 pour 0 quand la précision n'est pas définie.</p>`,
  },
  roc: {
    title: 'Courbe ROC',
    short: 'Taux de vrais positifs en fonction du taux de faux positifs, pour tous les seuils de décision.',
    body: String.raw`
      <p>Un modèle binaire décide « positif » quand son score dépasse un seuil. La courbe ROC
      trace, pour chaque seuil possible, le taux de vrais positifs, part des positifs retrouvés,
      en fonction du taux de faux positifs, part des négatifs classés positifs
      ([[positifs|vrais et faux positifs]]).</p>
      <p>Un seuil très haut donne le point (0, 0), un seuil très bas le point (1, 1). Un modèle
      qui trie parfaitement les élèves passe par (0, 1), et la diagonale correspond à un tirage
      au hasard. L'aire sous la courbe vaut la probabilité qu'un positif tiré au hasard ait un
      score plus grand qu'un négatif tiré au hasard.</p>`,
  },
};
