// Contenu du cours. Chaque étape correspond à un écran et à un fichier de
// steps/, dans l'ordre du parcours.
//
// `node` rattache l'étape à un nœud du schéma (steps/nodes.js). `lead(c)` est
// la fiche de l'étape ; `more(c)` le détail, sous le titre `moreTitle` s'il est
// donné. Les nombres viennent de c (context.js), jamais écrits en dur ; les
// symboles viennent de symbols.js, avec leur définition au survol.
//
// `calc` choisit les élèves et les colonnes du tableau, la ligne de pied, la
// matrice et le calcul déroulé ; views/calc.js les interprète.
//
// Sans validation croisée, les étapes de la branche des plis sont retirées.

import { config } from '../config.js';
import presentation from './steps/presentation.js';
import donnees from './steps/donnees.js';
import imputation from './steps/imputation.js';
import standardisation from './steps/standardisation.js';
import etiquettes from './steps/etiquettes.js';
import score from './steps/score.js';
import frontiere from './steps/frontiere.js';
import logistique from './steps/logistique.js';
import stabilite from './steps/stabilite.js';
import surface from './steps/surface.js';
import perteObservation from './steps/perte-observation.js';
import risque from './steps/risque.js';
import derivee from './steps/derivee.js';
import gradient from './steps/gradient.js';
import pas from './steps/pas.js';
import arret from './steps/arret.js';
import decision from './steps/decision.js';
import mesures from './steps/mesures.js';
import erreurs from './steps/erreurs.js';
import evaluationPli from './steps/evaluation-pli.js';
import validation from './steps/validation.js';
import confusion from './steps/confusion.js';
import prediction from './steps/prediction.js';

export { NODES } from './steps/nodes.js';

export const STEPS = [
  presentation,
  donnees,
  imputation,
  standardisation,
  etiquettes,
  score,
  frontiere,
  logistique,
  stabilite,
  surface,
  perteObservation,
  risque,
  derivee,
  gradient,
  pas,
  arret,
  decision,
  mesures,
  erreurs,
  evaluationPli,
  validation,
  confusion,
  prediction,
].filter((step) => config.cv || step.phase !== 'valid');
