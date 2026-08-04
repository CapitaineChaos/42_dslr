#!/usr/bin/env python3
"""Valide et calcule le micro-cas Gryffondor--Serpentard.

Le CSV est l'unique source de donnees. Le script impute et standardise a partir
des vingt observations d'apprentissage seulement, verifie l'optimum analytique
de la regression logistique, execute une descente de gradient, puis regenere les
artefacts internes du diaporama.

Construction du jeu d'apprentissage. La marge brute vaut m = V - 2P - 24 et ne
prend que trois valeurs : -10, 0 et +20. Sur chaque palier la proportion de
Gryffondor vaut respectivement 1/4, 1/2 et 9/10, dont les logits -ln3, 0 et
+2ln3 sont alignes sur la marge. Le maximum de vraisemblance est donc atteint
exactement en z = (ln3/10)(V - 2P - 24), sans separation parfaite ni forme
degeneree : la frontiere n'est ni la premiere bissectrice ni centree sur le
barycentre.
"""

from __future__ import annotations

import csv
import math
import statistics
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "eleves.csv"
CALCULATIONS = ROOT / "data" / "calculs.csv"
TEX_VALUES = ROOT / "valeurs.tex"

FIELDS = (
    "id",
    "eleve",
    "maison",
    "potions",
    "vol",
    "usage",
    "atypique",
)
GRYFFONDOR = "Gryffondor"
SERPENTARD = "Serpentard"
HOUSE_TO_Y = {GRYFFONDOR: 1, SERPENTARD: 0}
USAGES = {"apprentissage", "test"}
ATYPIQUES = {"E07", "E10", "E12", "E13", "E19", "E24", "E25"}
MISSING = {("E05", "potions"), ("E23", "flight")}
THRESHOLDS = (0.50, 0.65)

N_TRAIN = 20
N_TEST = 8
POTIONS_SLOPE = 2.0
BOUNDARY_OFFSET = 24.0
MARGIN_STEP = 10.0
# palier de marge -> (effectif, nombre de Gryffondor)
MARGIN_BANDS = {-10.0: (8, 2), 0.0: (2, 1), 20.0: (10, 9)}
MEAN_POTIONS = 10.0
MEAN_VOL = 50.0
SD_POTIONS = 5.0
SD_VOL = 18.0
MEDIAN_POTIONS = 9.0
MEDIAN_VOL = 51.0
COVARIANCE = 55.0


@dataclass(frozen=True)
class Student:
    ident: str
    name: str
    house: str
    potions: float
    flight: float
    y: int
    usage: str
    atypical: bool
    missing_potions: bool
    missing_flight: bool

    @property
    def margin(self) -> float:
        return self.flight - POTIONS_SLOPE * self.potions - BOUNDARY_OFFSET


@dataclass(frozen=True)
class ColumnStats:
    mean: float
    variance_population: float
    sd_population: float
    variance_sample: float
    sd_sample: float


@dataclass(frozen=True)
class Evaluation:
    tp: int
    fn: int
    fp: int
    tn: int
    accuracy: float
    precision: float
    recall: float
    specificity: float
    f1: float
    balanced_accuracy: float


@dataclass(frozen=True)
class Calculation:
    student: Student
    z_potions: float
    z_vol: float
    score: float
    probability: float
    loss: float
    predictions: tuple[int, ...]


def close(a: float, b: float, tolerance: float = 1e-12) -> bool:
    return abs(a - b) <= tolerance


def parse_grade(text: str, ident: str, field: str, maximum: float) -> float | None:
    text = text.strip()
    if not text:
        return None
    try:
        value = float(text)
    except ValueError as exc:
        raise ValueError(f"{ident}: {field} n'est pas un nombre: {text!r}") from exc
    if not math.isfinite(value) or not 0.0 <= value <= maximum:
        raise ValueError(f"{ident}: {field} doit etre compris entre 0 et {maximum:g}")
    if not value.is_integer():
        raise ValueError(f"{ident}: ce micro-cas attend des notes entieres")
    return value


def read_students() -> list[Student]:
    with SOURCE.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        if tuple(reader.fieldnames or ()) != FIELDS:
            raise ValueError(
                "en-tete inattendu: "
                f"{reader.fieldnames!r}; attendu: {list(FIELDS)!r}"
            )
        rows = list(reader)

    total = N_TRAIN + N_TEST
    if len(rows) != total:
        raise ValueError(f"le CSV doit contenir {total} eleves, pas {len(rows)}")

    parsed: list[dict[str, object]] = []
    for index, row in enumerate(rows, start=1):
        ident = row["id"].strip()
        expected_ident = f"E{index:02d}"
        if ident != expected_ident:
            raise ValueError(f"ligne {index}: id {ident!r}, attendu {expected_ident!r}")
        name = row["eleve"].strip()
        if not name:
            raise ValueError(f"{ident}: nom vide")
        house = row["maison"].strip()
        if house not in HOUSE_TO_Y:
            raise ValueError(f"{ident}: maison inconnue {house!r}")
        usage = row["usage"].strip()
        if usage not in USAGES:
            raise ValueError(f"{ident}: usage inconnu {usage!r}")
        atypical_text = row["atypique"].strip().casefold()
        if atypical_text not in {"oui", "non"}:
            raise ValueError(f"{ident}: atypique doit valoir oui ou non")
        parsed.append(
            {
                "ident": ident,
                "name": name,
                "house": house,
                "potions": parse_grade(row["potions"], ident, "potions", 20.0),
                "flight": parse_grade(row["vol"], ident, "vol", 100.0),
                "usage": usage,
                "atypical": atypical_text == "oui",
            }
        )

    observed_missing = {
        (record["ident"], field)
        for record in parsed
        for field in ("potions", "flight")
        if record[field] is None
    }
    if observed_missing != MISSING:
        raise ValueError(
            f"valeurs manquantes {observed_missing!r}; attendu {MISSING!r}"
        )

    train_records = [record for record in parsed if record["usage"] == "apprentissage"]
    median_potions = statistics.median(
        float(record["potions"]) for record in train_records if record["potions"] is not None
    )
    median_flight = statistics.median(
        float(record["flight"]) for record in train_records if record["flight"] is not None
    )
    if not close(median_potions, MEDIAN_POTIONS) or not close(median_flight, MEDIAN_VOL):
        raise AssertionError(
            f"medianes d'apprentissage {median_potions:g} et {median_flight:g}; "
            f"attendu {MEDIAN_POTIONS:g} et {MEDIAN_VOL:g}"
        )

    students = [
        Student(
            ident=str(record["ident"]),
            name=str(record["name"]),
            house=str(record["house"]),
            potions=(
                median_potions if record["potions"] is None else float(record["potions"])
            ),
            flight=(
                median_flight if record["flight"] is None else float(record["flight"])
            ),
            y=HOUSE_TO_Y[str(record["house"])],
            usage=str(record["usage"]),
            atypical=bool(record["atypical"]),
            missing_potions=record["potions"] is None,
            missing_flight=record["flight"] is None,
        )
        for record in parsed
    ]

    if len({student.name for student in students}) != len(students):
        raise ValueError("les noms d'eleves doivent etre uniques")
    if len({(student.potions, student.flight) for student in students}) != len(students):
        raise ValueError("deux eleves ne peuvent pas partager le meme couple de notes")
    if {student.ident for student in students if student.atypical} != ATYPIQUES:
        raise ValueError(f"les lignes atypiques doivent etre {sorted(ATYPIQUES)}")
    if [student.usage for student in students[:N_TRAIN]] != ["apprentissage"] * N_TRAIN:
        raise ValueError(f"E01 a E{N_TRAIN:02d} doivent constituer l'apprentissage")
    if [student.usage for student in students[N_TRAIN:]] != ["test"] * N_TEST:
        raise ValueError(f"les {N_TEST} dernieres lignes doivent constituer le test")
    return students


def column_stats(values: Sequence[float]) -> ColumnStats:
    if len(values) < 2:
        raise ValueError("deux valeurs au moins sont necessaires")
    mean = math.fsum(values) / len(values)
    squared = math.fsum((value - mean) ** 2 for value in values)
    return ColumnStats(
        mean=mean,
        variance_population=squared / len(values),
        sd_population=math.sqrt(squared / len(values)),
        variance_sample=squared / (len(values) - 1),
        sd_sample=math.sqrt(squared / (len(values) - 1)),
    )


def design_row(student: Student, potions: ColumnStats, flight: ColumnStats) -> tuple[float, ...]:
    return (
        1.0,
        (student.potions - potions.mean) / potions.sd_population,
        (student.flight - flight.mean) / flight.sd_population,
    )


def sigmoid(score: float) -> float:
    if score >= 0.0:
        return 1.0 / (1.0 + math.exp(-score))
    exponential = math.exp(score)
    return exponential / (1.0 + exponential)


def softplus(score: float) -> float:
    if score >= 0.0:
        return score + math.log1p(math.exp(-score))
    return math.log1p(math.exp(score))


def dot(left: Sequence[float], right: Sequence[float]) -> float:
    return math.fsum(a * b for a, b in zip(left, right, strict=True))


def mean_loss(
    weights: Sequence[float],
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
) -> float:
    return math.fsum(
        softplus(dot(weights, row)) - target * dot(weights, row)
        for row, target in zip(design, targets, strict=True)
    ) / len(targets)


def gradient(
    weights: Sequence[float],
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
) -> tuple[float, ...]:
    result = [0.0] * len(weights)
    for row, target in zip(design, targets, strict=True):
        residual = sigmoid(dot(weights, row)) - target
        for column, value in enumerate(row):
            result[column] += residual * value
    return tuple(value / len(targets) for value in result)


def exact_optimum(train: Sequence[Student]) -> tuple[tuple[float, ...], tuple[float, ...]]:
    """Optimum en forme close deduit des trois paliers de marge."""
    bands: dict[float, list[Student]] = {}
    for student in train:
        bands.setdefault(student.margin, []).append(student)
    if set(bands) != set(MARGIN_BANDS):
        raise AssertionError(f"paliers de marge {sorted(bands)}; attendu {sorted(MARGIN_BANDS)}")
    for margin, members in bands.items():
        size, gryffondors = MARGIN_BANDS[margin]
        if len(members) != size or sum(student.y for student in members) != gryffondors:
            raise AssertionError(
                f"palier {margin:+g}: {len(members)} eleves dont "
                f"{sum(student.y for student in members)} Gryffondor; "
                f"attendu {size} dont {gryffondors}"
            )
        # Sur un palier, tous les scores coincident : la proportion observee est
        # la probabilite ajustee, et son logit doit rester aligne sur la marge.
        proportion = gryffondors / size
        expected = math.log(proportion / (1.0 - proportion))
        if not close(expected, margin * math.log(3.0) / MARGIN_STEP, tolerance=1e-12):
            raise AssertionError(f"palier {margin:+g}: logit {expected} non aligne")

    unit = math.log(3.0) / MARGIN_STEP
    raw = (
        -BOUNDARY_OFFSET * unit,
        -POTIONS_SLOPE * unit,
        unit,
    )
    standardized = (
        unit * (MEAN_VOL - POTIONS_SLOPE * MEAN_POTIONS - BOUNDARY_OFFSET),
        -POTIONS_SLOPE * SD_POTIONS * unit,
        SD_VOL * unit,
    )
    return raw, standardized


def gradient_descent(
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
    *,
    alpha: float = 1.0,
    tolerance: float = 1e-12,
    maximum: int = 100_000,
) -> tuple[tuple[float, ...], int, list[tuple[int, float, tuple[float, ...], float]]]:
    weights = (0.0, 0.0, 0.0)
    snapshots = {0, 1, 2, 5, 10, 20, 50, 100, 200, 400}
    trace: list[tuple[int, float, tuple[float, ...], float]] = []

    for iteration in range(maximum + 1):
        current_gradient = gradient(weights, design, targets)
        norm = math.sqrt(math.fsum(value * value for value in current_gradient))
        cost = mean_loss(weights, design, targets)
        if iteration in snapshots:
            trace.append((iteration, cost, weights, norm))
        if norm <= tolerance:
            if not trace or trace[-1][0] != iteration:
                trace.append((iteration, cost, weights, norm))
            return weights, iteration, trace
        if iteration == maximum:
            break
        updated = tuple(
            value - alpha * slope for value, slope in zip(weights, current_gradient, strict=True)
        )
        next_cost = mean_loss(updated, design, targets)
        if next_cost > cost + 1e-14:
            raise AssertionError(
                f"le cout augmente au tour {iteration + 1}: {cost} -> {next_cost}"
            )
        weights = updated
    raise AssertionError(f"la descente n'a pas converge en {maximum} tours")


def finite_difference_check(
    weights: Sequence[float],
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
    h: float = 1e-5,
) -> list[tuple[int, float, float, float]]:
    analytic = gradient(weights, design, targets)
    checks: list[tuple[int, float, float, float]] = []
    for column, expected in enumerate(analytic):
        below = list(weights)
        above = list(weights)
        below[column] -= h
        above[column] += h
        measured = (
            mean_loss(above, design, targets) - mean_loss(below, design, targets)
        ) / (2.0 * h)
        checks.append((column, expected, measured, abs(expected - measured)))
    return checks


def calculate(
    students: Sequence[Student],
    potions: ColumnStats,
    flight: ColumnStats,
    weights: Sequence[float],
) -> list[Calculation]:
    calculations: list[Calculation] = []
    for student in students:
        row = design_row(student, potions, flight)
        score = dot(weights, row)
        # A l'optimum le score vaut exactement (ln3/12) fois la marge entiere.
        # Les eleves de marge nulle tombent pile sur le seuil 0,50 : sans ce
        # recalage, un residu flottant de 1e-16 deciderait de leur prediction.
        if abs(score) < 1e-9:
            score = 0.0
        probability = sigmoid(score)
        calculations.append(
            Calculation(
                student=student,
                z_potions=row[1],
                z_vol=row[2],
                score=score,
                probability=probability,
                loss=softplus(score) - student.y * score,
                predictions=tuple(int(probability >= threshold) for threshold in THRESHOLDS),
            )
        )
    return calculations


def evaluate(calculations: Sequence[Calculation], threshold_index: int) -> Evaluation:
    tp = fn = fp = tn = 0
    for calculation in calculations:
        target = calculation.student.y
        prediction = calculation.predictions[threshold_index]
        if target == 1 and prediction == 1:
            tp += 1
        elif target == 1:
            fn += 1
        elif prediction == 1:
            fp += 1
        else:
            tn += 1
    total = tp + fn + fp + tn
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    specificity = tn / (tn + fp) if tn + fp else 0.0
    f1 = 2.0 * precision * recall / (precision + recall) if precision + recall else 0.0
    return Evaluation(
        tp,
        fn,
        fp,
        tn,
        (tp + tn) / total,
        precision,
        recall,
        specificity,
        f1,
        (recall + specificity) / 2.0,
    )


def wilson_interval(successes: int, total: int, z: float = 1.959963984540054) -> tuple[float, float]:
    if not 0 <= successes <= total or total <= 0:
        raise ValueError("effectifs invalides pour l'intervalle de Wilson")
    proportion = successes / total
    denominator = 1.0 + z * z / total
    centre = (proportion + z * z / (2.0 * total)) / denominator
    half_width = (
        z
        * math.sqrt(
            proportion * (1.0 - proportion) / total
            + z * z / (4.0 * total * total)
        )
        / denominator
    )
    return centre - half_width, centre + half_width


def tex_escape(text: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(character, character) for character in text)


def decimal_tex(
    value: float,
    digits: int = 6,
    *,
    signed: bool = False,
    trim: bool = False,
) -> str:
    if abs(value) < 0.5 * 10 ** (-digits):
        value = 0.0
    text = f"{value:+.{digits}f}" if signed else f"{value:.{digits}f}"
    if trim and "." in text:
        text = text.rstrip("0").rstrip(".")
    return text.replace(".", "{,}")


def compact_magnitude_tex(value: float) -> str:
    if value == 0.0:
        return "0"
    if abs(value) >= 1e-3:
        return decimal_tex(value, digits=6)
    exponent = math.floor(math.log10(abs(value)))
    mantissa = value / (10.0**exponent)
    return decimal_tex(mantissa, digits=3, trim=True) + rf"\times10^{{{exponent}}}"


def csv_number(value: float, digits: int = 9) -> str:
    if abs(value) < 0.5 * 10 ** (-digits):
        value = 0.0
    return f"{value:.{digits}f}".replace(".", ",")


def short_house(house: str) -> str:
    return "Gryff." if house == GRYFFONDOR else "Serp."


def coordinate_list(students: Iterable[Student]) -> str:
    return " ".join(f"({student.potions:g},{student.flight:g})" for student in students)


def standardized_coordinate_list(
    students: Iterable[Student],
    potions: ColumnStats,
    flight: ColumnStats,
) -> str:
    return " ".join(
        "("
        + decimal_tex((student.potions - potions.mean) / potions.sd_population, 4, trim=True).replace("{,}", ".")
        + ","
        + decimal_tex((student.flight - flight.mean) / flight.sd_population, 4, trim=True).replace("{,}", ".")
        + ")"
        for student in students
    )


def tex_dataset_rows(students: Iterable[Student], *, raw: bool) -> str:
    rows = []
    for student in students:
        potions = (
            r"\textcolor{warning}{---}"
            if raw and student.missing_potions
            else f"${student.potions:g}$"
        )
        flight = (
            r"\textcolor{warning}{---}"
            if raw and student.missing_flight
            else f"${student.flight:g}$"
        )
        rows.append(
            f"{student.ident} & {tex_escape(student.name)} & {student.house} "
            f"& {potions} & {flight} \\\\"
        )
    return "\n".join(rows)


def tex_calculation_rows(calculations: Iterable[Calculation]) -> str:
    rows = []
    for calculation in calculations:
        prediction_low = short_house(
            GRYFFONDOR if calculation.predictions[0] else SERPENTARD
        )
        prediction_high = short_house(
            GRYFFONDOR if calculation.predictions[1] else SERPENTARD
        )
        rows.append(
            f"{calculation.student.ident} & {tex_escape(calculation.student.name.split()[0])} & "
            f"{short_house(calculation.student.house)} & "
            f"${decimal_tex(calculation.score, signed=True)}$ & "
            f"${decimal_tex(calculation.probability)}$ & "
            f"{prediction_low} & {prediction_high} \\\\"
        )
    return "\n".join(rows)


def metric_text(metric: Evaluation) -> str:
    return f"VP $={metric.tp}$, FN $={metric.fn}$, FP $={metric.fp}$, VN $={metric.tn}$"


# Geometrie du nuage de la planche "Distribution des notes" : la zone tracee
# mesure environ 344 x 152 points pour Potions dans [0,20] et Vol dans [0,100].
# Les etiquettes sont posees par recherche de position, jamais a la main : un
# changement de note deplace automatiquement le nom qui va avec.
PLOT_WIDTH_PT = 344.0
PLOT_HEIGHT_PT = 152.0
POTIONS_MAX = 20.0
VOL_MAX = 100.0
CHAR_WIDTH_PT = 3.3
LABEL_PADDING_PT = 2.4
LABEL_HEIGHT_PT = 7.4
MARKER_HALF_PT = 3.6
CANDIDATE_RADII = (9.0, 13.0, 17.0, 22.0)
CANDIDATE_ANGLES = tuple(range(0, 360, 30))


def _boxes_overlap(
    a: tuple[float, float, float, float], b: tuple[float, float, float, float]
) -> float:
    """Surface d'intersection de deux boites (cx, cy, demi-largeur, demi-hauteur)."""
    dx = (a[2] + b[2]) - abs(a[0] - b[0])
    dy = (a[3] + b[3]) - abs(a[1] - b[1])
    return dx * dy if dx > 0.0 and dy > 0.0 else 0.0


def place_labels(students: Sequence[Student]) -> dict[str, tuple[int, int]]:
    """Choisit un decalage par etiquette en evitant marqueurs et voisines."""
    x_scale = PLOT_WIDTH_PT / POTIONS_MAX
    y_scale = PLOT_HEIGHT_PT / VOL_MAX
    centres = {
        student.ident: (student.potions * x_scale, student.flight * y_scale)
        for student in students
    }
    half_width = {
        student.ident: (
            len(student.name.split()[0]) * CHAR_WIDTH_PT + LABEL_PADDING_PT
        ) / 2.0
        for student in students
    }
    markers = [
        (x, y, MARKER_HALF_PT, MARKER_HALF_PT) for x, y in centres.values()
    ]

    candidates = [
        (
            round(radius * math.cos(math.radians(angle))),
            round(radius * math.sin(math.radians(angle))),
            radius,
        )
        for radius in CANDIDATE_RADII
        for angle in CANDIDATE_ANGLES
    ]

    def cost(student: Student, shift: tuple[int, int, float], placed: dict[str, tuple[float, float, float, float]]) -> float:
        dx, dy, radius = shift
        cx, cy = centres[student.ident]
        box = (cx + dx, cy + dy, half_width[student.ident], LABEL_HEIGHT_PT / 2.0)
        penalty = 0.28 * radius
        if not (0.0 <= box[0] - box[2] and box[0] + box[2] <= PLOT_WIDTH_PT):
            penalty += 900.0
        if not (0.0 <= box[1] - box[3] and box[1] + box[3] <= PLOT_HEIGHT_PT):
            penalty += 900.0
        for marker in markers:
            penalty += 9.0 * _boxes_overlap(box, marker)
        for ident, other in placed.items():
            if ident != student.ident:
                penalty += 6.0 * _boxes_overlap(box, other)
        return penalty

    order = sorted(students, key=lambda s: (-s.flight, s.potions))
    chosen: dict[str, tuple[int, int, float]] = {}
    placed: dict[str, tuple[float, float, float, float]] = {}
    for _ in range(4):  # une passe de pose, puis trois passes de reprise
        for student in order:
            best = min(candidates, key=lambda shift: cost(student, shift, placed))
            chosen[student.ident] = best
            cx, cy = centres[student.ident]
            placed[student.ident] = (
                cx + best[0], cy + best[1], half_width[student.ident], LABEL_HEIGHT_PT / 2.0
            )
    return {ident: (shift[0], shift[1]) for ident, shift in chosen.items()}


def tex_all_labels(students: Sequence[Student]) -> str:
    shifts = place_labels(students)
    labels = []
    for student in students:
        xshift, yshift = shifts[student.ident]
        color = "coursescore!88!ink" if student.house == GRYFFONDOR else "warning!88!ink"
        first_name = tex_escape(student.name.split()[0])
        labels.append(
            rf"\node[font=\tiny\bfseries,text={color},fill=white,fill opacity=.82,"
            rf"text opacity=1,inner sep=.6pt,xshift={xshift}pt,yshift={yshift}pt] "
            rf"at (axis cs:{student.potions:g},{student.flight:g}) {{{first_name}}};"
        )
    return "\n".join(labels)


def write_calculations(calculations: Sequence[Calculation]) -> None:
    fieldnames = (
        "id",
        "eleve",
        "maison",
        "usage",
        "atypique",
        "potions_absente",
        "vol_absent",
        "potions_preparee",
        "vol_prepare",
        "y",
        "marge",
        "x_potions",
        "x_vol",
        "score",
        "probabilite",
        "perte",
        "prediction_tau_050",
        "correct_tau_050",
        "prediction_tau_065",
        "correct_tau_065",
    )
    with CALCULATIONS.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, delimiter=";", lineterminator="\n")
        writer.writeheader()
        for calculation in calculations:
            student = calculation.student
            writer.writerow(
                {
                    "id": student.ident,
                    "eleve": student.name,
                    "maison": student.house,
                    "usage": student.usage,
                    "atypique": "oui" if student.atypical else "non",
                    "potions_absente": "oui" if student.missing_potions else "non",
                    "vol_absent": "oui" if student.missing_flight else "non",
                    "potions_preparee": f"{student.potions:g}",
                    "vol_prepare": f"{student.flight:g}",
                    "y": student.y,
                    "marge": f"{student.margin:g}",
                    "x_potions": csv_number(calculation.z_potions),
                    "x_vol": csv_number(calculation.z_vol),
                    "score": csv_number(calculation.score),
                    "probabilite": csv_number(calculation.probability),
                    "perte": csv_number(calculation.loss),
                    "prediction_tau_050": calculation.predictions[0],
                    "correct_tau_050": int(calculation.predictions[0] == student.y),
                    "prediction_tau_065": calculation.predictions[1],
                    "correct_tau_065": int(calculation.predictions[1] == student.y),
                }
            )


def write_tex_values(
    students: Sequence[Student],
    potions: ColumnStats,
    flight: ColumnStats,
    raw_optimum: Sequence[float],
    standardized_optimum: Sequence[float],
    gd_weights: Sequence[float],
    gd_alpha: float,
    gd_iterations: int,
    gd_trace: Sequence[tuple[int, float, tuple[float, ...], float]],
    gradient_checks: Sequence[tuple[int, float, float, float]],
    calculations: Sequence[Calculation],
    metrics: dict[tuple[str, float], Evaluation],
) -> None:
    train = [student for student in students if student.usage == "apprentissage"]
    test = [student for student in students if student.usage == "test"]
    train_calculations = [item for item in calculations if item.student.usage == "apprentissage"]
    test_calculations = [item for item in calculations if item.student.usage == "test"]
    train_loss = math.fsum(item.loss for item in train_calculations) / len(train_calculations)
    test_loss = math.fsum(item.loss for item in test_calculations) / len(test_calculations)

    gd_rows = []
    for iteration, cost, weights, norm in gd_trace:
        gd_rows.append(
            f"${iteration}$ & ${decimal_tex(cost)}$ & "
            f"${decimal_tex(weights[0], signed=True)}$ & "
            f"${decimal_tex(weights[1], signed=True)}$ & "
            f"${decimal_tex(weights[2], signed=True)}$ & "
            f"${compact_magnitude_tex(norm)}$ \\\\"
        )
    check_rows = []
    for column, analytic, measured, difference in gradient_checks:
        check_rows.append(
            f"${column}$ & ${decimal_tex(analytic, digits=9, signed=True)}$ & "
            f"${decimal_tex(measured, digits=9, signed=True)}$ & "
            f"${decimal_tex(difference, digits=11)}$ \\\\"
        )
    metric_rows = []
    for usage in ("apprentissage", "test"):
        for threshold in THRESHOLDS:
            metric = metrics[(usage, threshold)]
            metric_rows.append(
                f"{usage} & ${decimal_tex(threshold, 2)}$ & ${metric.tp}$ & ${metric.fn}$ "
                f"& ${metric.fp}$ & ${metric.tn}$ & ${decimal_tex(metric.accuracy, 4)}$ "
                f"& ${decimal_tex(metric.precision, 4)}$ & ${decimal_tex(metric.recall, 4)}$ "
                f"& ${decimal_tex(metric.specificity, 4)}$ & ${decimal_tex(metric.f1, 4)}$ "
                f"& ${decimal_tex(metric.balanced_accuracy, 4)}$ \\\\"
            )
    test_summary_rows = []
    for threshold in THRESHOLDS:
        metric = metrics[("test", threshold)]
        test_summary_rows.append(
            f"${decimal_tex(threshold, 2)}$ & ${decimal_tex(metric.accuracy, 4)}$ "
            f"& ${decimal_tex(metric.precision, 4)}$ & ${decimal_tex(metric.recall, 4)}$ "
            f"& ${decimal_tex(metric.specificity, 4)}$ & ${decimal_tex(metric.f1, 4)}$ \\\\"
        )

    test_at_half = metrics[("test", 0.50)]
    wilson_low, wilson_high = wilson_interval(test_at_half.tp + test_at_half.tn, len(test))
    train_gryffondor = sum(student.y for student in train)
    calculations_by_id = {item.student.ident: item for item in calculations}

    def command(name: str, value: str) -> str:
        return rf"\newcommand{{\{name}}}{{{value}}}"

    lines = [
        "% Fichier genere par scripts/construire_cas.py ; ne pas modifier.",
        "% Les donnees brutes, l'imputation et les calculs viennent de data/eleves.csv.",
        "",
        command("MicroGryffondorLabel", GRYFFONDOR),
        command("MicroSerpentardLabel", SERPENTARD),
        command("MicroNTrain", str(len(train))),
        command("MicroNTest", str(len(test))),
        command("MicroTrainGryffondor", str(train_gryffondor)),
        command("MicroTrainSerpentard", str(len(train) - train_gryffondor)),
        command("MicroMedianPotions", decimal_tex(MEDIAN_POTIONS, trim=True)),
        command("MicroMedianVol", decimal_tex(MEDIAN_VOL, trim=True)),
        command("MicroMeanPotions", decimal_tex(potions.mean, trim=True)),
        command("MicroMeanVol", decimal_tex(flight.mean, trim=True)),
        command("MicroSdPotions", decimal_tex(potions.sd_population, trim=True)),
        command("MicroSdVol", decimal_tex(flight.sd_population, trim=True)),
        command("MicroTrainCovariance", decimal_tex(COVARIANCE, trim=True)),
        command("MicroTrainCorrelation", r"\frac{11}{18}"),
        command("MicroMarginExpr", "V-2P-24"),
        command("MicroBoundaryRaw", "V=2P+24"),
        command("MicroMarginStep", decimal_tex(MARGIN_STEP, trim=True)),
        command("MicroScoreFromMargin", r"z=\frac{\ln 3}{10}\left(V-2P-24\right)"),
        command("MicroLogOddsHigh", r"+2\ln 3"),
        command("MicroLogOddsMid", "0"),
        command("MicroLogOddsLow", r"-\ln 3"),
        command("MicroExactProbabilityHigh", r"\frac{9}{10}"),
        command("MicroExactProbabilityMid", r"\frac{1}{2}"),
        command("MicroExactProbabilityLow", r"\frac{1}{4}"),
        command("MicroBandHighSize", str(MARGIN_BANDS[20.0][0])),
        command("MicroBandMidSize", str(MARGIN_BANDS[0.0][0])),
        command("MicroBandLowSize", str(MARGIN_BANDS[-10.0][0])),
        command(
            "MicroW",
            r"\left(\frac{3\ln 3}{5}\,;\,-\ln 3\,;\,+\frac{9\ln 3}{5}\right)",
        ),
        command(
            "MicroWDecimal",
            r"\left(" + r"\,;\,".join(
                decimal_tex(value, signed=True) for value in standardized_optimum
            ) + r"\right)",
        ),
        command(
            "MicroRawBeta",
            r"\left(-\frac{12\ln 3}{5}\,;\,-\frac{\ln 3}{5}\,;\,+\frac{\ln 3}{10}\right)",
        ),
        command(
            "MicroRawBetaDecimal",
            r"\left(" + r"\,;\,".join(
                decimal_tex(value, signed=True) for value in raw_optimum
            ) + r"\right)",
        ),
        command("MicroTrainLoss", decimal_tex(train_loss)),
        command("MicroTestLoss", decimal_tex(test_loss)),
        command("MicroGDAlpha", decimal_tex(gd_alpha, 2)),
        command("MicroGDIterations", str(gd_iterations)),
        command(
            "MicroGDLoss",
            decimal_tex(
                mean_loss(
                    gd_weights,
                    [design_row(student, potions, flight) for student in train],
                    [student.y for student in train],
                )
            ),
        ),
        command(
            "MicroGDW",
            r"\left(" + r"\,;\,".join(
                decimal_tex(value, signed=True) for value in gd_weights
            ) + r"\right)",
        ),
        command(
            "MicroGradientMaxError",
            decimal_tex(max(row[3] for row in gradient_checks), digits=11),
        ),
        command("MicroThresholdLow", decimal_tex(THRESHOLDS[0], 2)),
        command("MicroThresholdHigh", decimal_tex(THRESHOLDS[1], 2)),
        command("MicroTrainAccuracy", decimal_tex(metrics[("apprentissage", 0.50)].accuracy, 4)),
        command("MicroTrainBaseline", decimal_tex(train_gryffondor / len(train), 4)),
        command("MicroTestAccuracy", decimal_tex(metrics[("test", 0.50)].accuracy, 4)),
        command("MicroTestAccuracyTauHigh", decimal_tex(metrics[("test", 0.65)].accuracy, 4)),
        command("MicroTestPrecision", decimal_tex(test_at_half.precision, 4)),
        command("MicroTestRecall", decimal_tex(test_at_half.recall, 4)),
        command("MicroTestSpecificity", decimal_tex(test_at_half.specificity, 4)),
        command("MicroTestFScore", decimal_tex(test_at_half.f1, 4)),
        command("MicroTestPrecisionTauHigh", decimal_tex(metrics[("test", 0.65)].precision, 4)),
        command("MicroTestRecallTauHigh", decimal_tex(metrics[("test", 0.65)].recall, 4)),
        command("MicroTestWilsonLow", decimal_tex(wilson_low, 6)),
        command("MicroTestWilsonHigh", decimal_tex(wilson_high, 6)),
        command("MicroTrainConfusion", metric_text(metrics[("apprentissage", 0.50)])),
        command("MicroTestConfusion", metric_text(metrics[("test", 0.50)])),
        command("MicroTestConfusionTauHigh", metric_text(metrics[("test", 0.65)])),
        command("MicroTrainRows", "\n" + tex_dataset_rows(train, raw=True)),
        command("MicroTrainPreparedRows", "\n" + tex_dataset_rows(train, raw=False)),
        command("MicroTestRawRows", "\n" + tex_dataset_rows(test, raw=True)),
        command("MicroTestPreparedRows", "\n" + tex_dataset_rows(test, raw=False)),
        command("MicroAllGryffondorCoords", coordinate_list(s for s in students if s.y == 1)),
        command("MicroAllSerpentardCoords", coordinate_list(s for s in students if s.y == 0)),
        command("MicroTrainGryffondorCoords", coordinate_list(s for s in train if s.y == 1)),
        command("MicroTrainSerpentardCoords", coordinate_list(s for s in train if s.y == 0)),
        command("MicroTestGryffondorCoords", coordinate_list(s for s in test if s.y == 1)),
        command("MicroTestSerpentardCoords", coordinate_list(s for s in test if s.y == 0)),
        command(
            "MicroTrainGryffondorStdCoords",
            standardized_coordinate_list((s for s in train if s.y == 1), potions, flight),
        ),
        command(
            "MicroTrainSerpentardStdCoords",
            standardized_coordinate_list((s for s in train if s.y == 0), potions, flight),
        ),
        command(
            "MicroMissingCoords",
            coordinate_list(s for s in students if s.missing_potions or s.missing_flight),
        ),
        command("MicroAllNameLabels", "\n" + tex_all_labels(list(students))),
        command("MicroTrainAtypicalCoords", coordinate_list(s for s in train if s.atypical)),
        command("MicroTestAtypicalCoords", coordinate_list(s for s in test if s.atypical)),
        command("MicroGDTableRows", "\n" + "\n".join(gd_rows)),
        command("MicroGradientCheckRows", "\n" + "\n".join(check_rows)),
        command("MicroMetricsRows", "\n" + "\n".join(metric_rows)),
        command("MicroTestSummaryRows", "\n" + "\n".join(test_summary_rows)),
        command("MicroTrainCalcRows", "\n" + tex_calculation_rows(train_calculations)),
        command("MicroTestCalcRows", "\n" + tex_calculation_rows(test_calculations)),
        command("MicroProbabilityGeorge", decimal_tex(calculations_by_id["E23"].probability)),
        command("MicroProbabilityDaphne", decimal_tex(calculations_by_id["E25"].probability)),
        command("MicroProbabilityAlicia", decimal_tex(calculations_by_id["E24"].probability)),
        command("MicroProbabilityFred", decimal_tex(calculations_by_id["E21"].probability)),
        "",
    ]
    TEX_VALUES.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    students = read_students()
    train = [student for student in students if student.usage == "apprentissage"]
    potions = column_stats([student.potions for student in train])
    flight = column_stats([student.flight for student in train])

    expected_stats = {
        "potions": (potions, MEAN_POTIONS, SD_POTIONS),
        "vol": (flight, MEAN_VOL, SD_VOL),
    }
    for label, (stats, expected_mean, expected_sd) in expected_stats.items():
        if not close(stats.mean, expected_mean) or not close(stats.sd_population, expected_sd):
            raise AssertionError(
                f"{label}: moyenne {expected_mean:g} et ecart-type {expected_sd:g} attendus, "
                f"obtenu {stats.mean:g} et {stats.sd_population:g}"
            )
    centered_products = math.fsum(
        (student.potions - potions.mean) * (student.flight - flight.mean)
        for student in train
    )
    if not close(centered_products / len(train), COVARIANCE):
        raise AssertionError(f"covariance population attendue: {COVARIANCE:g}")

    train_design = [design_row(student, potions, flight) for student in train]
    targets = [student.y for student in train]
    raw_optimum, standardized_optimum = exact_optimum(train)
    exact_gradient = gradient(standardized_optimum, train_design, targets)
    if max(abs(value) for value in exact_gradient) > 2e-15:
        raise AssertionError(f"gradient non nul a l'optimum exact: {exact_gradient}")

    # Les deux ecritures du meme modele doivent coincider sur toutes les lignes.
    for student in students:
        row = design_row(student, potions, flight)
        brut = raw_optimum[0] + raw_optimum[1] * student.potions + raw_optimum[2] * student.flight
        if not close(dot(standardized_optimum, row), brut, tolerance=1e-12):
            raise AssertionError(f"{student.ident}: scores brut et standardise divergents")

    alpha = 1.0
    gd_weights, gd_iterations, gd_trace = gradient_descent(train_design, targets, alpha=alpha)
    if max(abs(a - b) for a, b in zip(gd_weights, standardized_optimum, strict=True)) > 2e-9:
        raise AssertionError(
            f"la descente ne rejoint pas l'optimum exact: {gd_weights} != {standardized_optimum}"
        )

    probe = (0.2, -0.4, 0.3)
    gradient_checks = finite_difference_check(probe, train_design, targets)
    if max(row[3] for row in gradient_checks) > 2e-9:
        raise AssertionError(f"controle du gradient insuffisant: {gradient_checks}")

    calculations = calculate(students, potions, flight, standardized_optimum)
    metrics: dict[tuple[str, float], Evaluation] = {}
    for usage in ("apprentissage", "test"):
        subset = [item for item in calculations if item.student.usage == usage]
        for index, threshold in enumerate(THRESHOLDS):
            metrics[(usage, threshold)] = evaluate(subset, index)

    expected_confusions = {
        ("apprentissage", 0.50): (10, 2, 2, 6),
        ("apprentissage", 0.65): (9, 3, 1, 7),
        ("test", 0.50): (3, 1, 1, 3),
        ("test", 0.65): (2, 2, 0, 4),
    }
    for key, expected in expected_confusions.items():
        metric = metrics[key]
        observed = (metric.tp, metric.fn, metric.fp, metric.tn)
        if observed != expected:
            raise AssertionError(f"{key}: confusion {observed}, attendu {expected}")

    write_calculations(calculations)
    write_tex_values(
        students,
        potions,
        flight,
        raw_optimum,
        standardized_optimum,
        gd_weights,
        alpha,
        gd_iterations,
        gd_trace,
        gradient_checks,
        calculations,
        metrics,
    )
    print(
        f"{SOURCE.name}: {len(train)} apprentissage + {len(students) - len(train)} test; "
        f"mu=({MEAN_POTIONS:g},{MEAN_VOL:g}), sigma=({SD_POTIONS:g},{SD_VOL:g}); "
        f"GD alpha={alpha:g} en {gd_iterations} tours"
    )
    print(f"{CALCULATIONS}: {len(calculations)} lignes calculees")
    print(f"{TEX_VALUES}: macros LaTeX regenerees")


if __name__ == "__main__":
    main()
