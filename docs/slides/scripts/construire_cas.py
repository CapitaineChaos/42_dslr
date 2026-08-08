#!/usr/bin/env python3
"""Valide et calcule le micro-cas Gryffondor--Serpentard.

Le CSV est l'unique source de donnees. Le script impute et standardise a partir
des vingt observations d'apprentissage seulement, resout la regression
logistique par Newton-Raphson, verifie la solution par une descente de gradient,
puis regenere les artefacts internes du diaporama.

Construction du jeu. Les observations forment deux agregats compacts dans le
plan (Potions, Vol) : Gryffondor sur des notes de Potions basses et de Vol
elevees, Serpentard a l'oppose. Six observations se situent dans l'agregat de la
maison opposee ; ce recouvrement rend l'optimum fini, contraste les pertes
individuelles et conditionne l'existence de faux positifs et de faux negatifs.

Les statistiques d'apprentissage sont rondes par construction (moyennes 10 et
50, ecarts-types 4 et 20, covariance -64, donc correlation -4/5) : chaque
standardisation reste verifiable sans calculatrice.
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
# Observations en recouvrement et profils frontaliers : elles concentrent les
# pertes elevees et l'ensemble des erreurs de classement.
ATYPIQUES = {"E03", "E10", "E12", "E13", "E19", "E22", "E24", "E25"}
MISSING = {("E05", "potions"), ("E23", "flight")}
THRESHOLDS = (0.50, 0.65)

N_TRAIN = 20
N_TEST = 8
MEAN_POTIONS = 10.0
MEAN_VOL = 50.0
SD_POTIONS = 4.0
SD_VOL = 20.0
MEDIAN_POTIONS = 10.0
MEDIAN_VOL = 57.0
COVARIANCE = -64.0
CORRELATION_TEX = r"-\frac{4}{5}"
# Coefficients d'essai des planches pedagogiques : z = x_vol - 2 x_pot.
TRIAL_WEIGHTS = (0.0, -2.0, 1.0)
TRIAL_TEX = r"(0,-2,+1)"
TRIAL_SCORE_TEX = r"z=x_{\mathrm{vol}}-2x_{\mathrm{pot}}"


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


def solve3(matrix: Sequence[Sequence[float]], right: Sequence[float]) -> tuple[float, ...]:
    """Pivot de Gauss sur un systeme 3x3, avec choix du pivot maximal."""
    rows = [list(row) + [value] for row, value in zip(matrix, right, strict=True)]
    for column in range(3):
        pivot = max(range(column, 3), key=lambda index: abs(rows[index][column]))
        rows[column], rows[pivot] = rows[pivot], rows[column]
        if abs(rows[column][column]) < 1e-14:
            raise AssertionError("systeme singulier : la hessienne n'est pas inversible")
        for index in range(3):
            if index != column:
                factor = rows[index][column] / rows[column][column]
                rows[index] = [a - factor * b for a, b in zip(rows[index], rows[column])]
    return tuple(rows[index][3] / rows[index][index] for index in range(3))


def newton_optimum(
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
    *,
    tolerance: float = 1e-15,
    maximum: int = 100,
) -> tuple[float, ...]:
    """Maximum de vraisemblance par Newton-Raphson sur les scores standardises.

    La perte logistique est strictement convexe des que les deux maisons se
    recouvrent : l'optimum est unique et Newton l'atteint a la precision
    machine en une dizaine de tours.
    """
    weights = (0.0, 0.0, 0.0)
    size = len(targets)
    for _ in range(maximum):
        probabilities = [sigmoid(dot(weights, row)) for row in design]
        slope = gradient(weights, design, targets)
        hessian = [
            [
                math.fsum(
                    probability * (1.0 - probability) * row[j] * row[k]
                    for probability, row in zip(probabilities, design, strict=True)
                ) / size
                for k in range(3)
            ]
            for j in range(3)
        ]
        step = solve3(hessian, slope)
        weights = tuple(value - move for value, move in zip(weights, step, strict=True))
        if max(abs(move) for move in step) <= tolerance:
            return weights
    raise AssertionError(f"Newton n'a pas converge en {maximum} tours")


def raw_coefficients(
    weights: Sequence[float],
    potions: ColumnStats,
    flight: ColumnStats,
) -> tuple[float, ...]:
    """Reecriture du meme modele sur les notes brutes."""
    beta_potions = weights[1] / potions.sd_population
    beta_flight = weights[2] / flight.sd_population
    return (
        weights[0] - beta_potions * potions.mean - beta_flight * flight.mean,
        beta_potions,
        beta_flight,
    )


def boundary_line(raw: Sequence[float]) -> tuple[float, float]:
    """Droite V = pente * P + ordonnee ou le score s'annule."""
    return -raw[1] / raw[2], -raw[0] / raw[2]


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
        probability = sigmoid(score)
        # Aucun eleve ne doit tomber sur le seuil : sinon un residu flottant de
        # 1e-16 deciderait de sa prediction.
        for threshold in THRESHOLDS:
            if abs(probability - threshold) < 1e-6:
                raise AssertionError(
                    f"{student.ident}: probabilite {probability} collee au seuil {threshold}"
                )
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


def house_color(house: str) -> str:
    """Teinte de la maison, celle-la meme que porte son marqueur dans les nuages."""
    return "coursescore!88!ink" if house == GRYFFONDOR else "warning!88!ink"


def house_tex(house: str, *, short: bool = False) -> str:
    """Nom de maison teinte, abrege quand la colonne est etroite."""
    return rf"\textcolor{{{house_color(house)}}}{{{short_house(house) if short else house}}}"


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


def pair_list(pairs: Iterable[tuple[float, float]]) -> str:
    """Suite de couples au point decimal, prete pour un addplot coordinates."""
    return " ".join(f"({first:.6f},{second:.6f})" for first, second in pairs)


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
            f"{student.ident} & {tex_escape(student.name)} & {house_tex(student.house)} "
            f"& {potions} & {flight} \\\\"
        )
    return "\n".join(rows)


def tex_compact_rows(students: Iterable[Student]) -> str:
    """Liste d'appel du nuage : prenom, maison, deux notes brutes.

    Le prenom et la maison reprennent la couleur du marqueur place en regard ;
    aucune legende supplementaire n'est necessaire.
    """
    rows = []
    for student in students:
        potions = (
            r"\textcolor{warning}{---}"
            if student.missing_potions
            else f"${student.potions:g}$"
        )
        flight = (
            r"\textcolor{warning}{---}"
            if student.missing_flight
            else f"${student.flight:g}$"
        )
        rows.append(
            rf"\textcolor{{{house_color(student.house)}}}"
            rf"{{{tex_escape(student.name.split()[0])}}} & "
            f"{house_tex(student.house)} & {potions} & {flight} \\\\"
        )
    return "\n".join(rows)


def tex_calculation_rows(calculations: Iterable[Calculation]) -> str:
    rows = []
    for calculation in calculations:
        prediction_low = house_tex(
            GRYFFONDOR if calculation.predictions[0] else SERPENTARD, short=True
        )
        prediction_high = house_tex(
            GRYFFONDOR if calculation.predictions[1] else SERPENTARD, short=True
        )
        rows.append(
            f"{calculation.student.ident} & {tex_escape(calculation.student.name.split()[0])} & "
            f"{house_tex(calculation.student.house, short=True)} & "
            f"${decimal_tex(calculation.score, signed=True)}$ & "
            f"${decimal_tex(calculation.probability)}$ & "
            f"{prediction_low} & {prediction_high} \\\\"
        )
    return "\n".join(rows)


def metric_text(metric: Evaluation) -> str:
    return f"VP $={metric.tp}$, FN $={metric.fn}$, FP $={metric.fp}$, VN $={metric.tn}$"


def plain(value: float, digits: int = 6) -> str:
    """Nombre au point decimal, pour les expressions lues par pgfplots."""
    return f"{value:.{digits}f}"


def boundary_tex(slope: float, intercept: float) -> str:
    return (
        f"V={decimal_tex(slope, 4)}\\,P{decimal_tex(intercept, 4, signed=True)}"
    )


def vector_tex(values: Sequence[float], digits: int = 6) -> str:
    return (
        r"\left("
        + r"\,;\,".join(decimal_tex(value, digits, signed=True) for value in values)
        + r"\right)"
    )


def trial_rows(
    students: Sequence[Student],
    potions: ColumnStats,
    flight: ColumnStats,
) -> str:
    rows = []
    for student in students:
        _, x_potions, x_flight = design_row(student, potions, flight)
        score = dot(TRIAL_WEIGHTS, (1.0, x_potions, x_flight))
        rows.append(
            f"{tex_escape(student.name.split()[0])} & "
            f"${decimal_tex(x_potions, 2, signed=True)}$ & "
            f"${decimal_tex(x_flight, 2, signed=True)}$ & "
            f"${decimal_tex(TRIAL_WEIGHTS[1] * x_potions, 2, signed=True)}$ & "
            f"${decimal_tex(TRIAL_WEIGHTS[2] * x_flight, 2, signed=True)}$ & "
            f"${decimal_tex(score, 2, signed=True)}$ & "
            f"${decimal_tex(sigmoid(score), 3)}$ & "
            f"${decimal_tex(softplus(score) - student.y * score, 3)}$ \\\\"
        )
    return "\n".join(rows)


def trial_probability_rows(
    students: Sequence[Student],
    potions: ColumnStats,
    flight: ColumnStats,
) -> str:
    rows = []
    for student in students:
        score = dot(TRIAL_WEIGHTS, design_row(student, potions, flight))
        favoured = GRYFFONDOR if score > 0.0 else SERPENTARD
        mark = "" if (score > 0.0) == bool(student.y) else r"\;\textcolor{warning}{$\bullet$}"
        rows.append(
            f"{tex_escape(student.name.split()[0])} & {house_tex(student.house)} & "
            f"${decimal_tex(score, 2, signed=True)}$ & "
            f"${decimal_tex(sigmoid(score), 3)}$ & {house_tex(favoured)}{mark} \\\\"
        )
    return "\n".join(rows)


def residual_rows(
    students: Sequence[Student],
    potions: ColumnStats,
    flight: ColumnStats,
) -> str:
    """Contribution au gradient a l'initialisation w = 0, ou tous les p valent 1/2."""
    rows = []
    for student in students:
        _, x_potions, x_flight = design_row(student, potions, flight)
        residual = 0.5 - student.y
        rows.append(
            f"{tex_escape(student.name.split()[0])} & ${student.y}$ & "
            f"${decimal_tex(residual, 1, signed=True)}$ & "
            f"${decimal_tex(x_potions, 2, signed=True)}$ & "
            f"${decimal_tex(residual * x_potions, 3, signed=True)}$ & "
            f"${decimal_tex(residual * x_flight, 3, signed=True)}$ \\\\"
        )
    return "\n".join(rows)


def first_order_rows(
    weights: Sequence[float],
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
) -> str:
    """Les trois conditions du premier ordre, colonne par colonne."""
    labels = ("1", r"x_{\mathrm{pot}}", r"x_{\mathrm{vol}}")
    residuals = [sigmoid(dot(weights, row)) - target
                 for row, target in zip(design, targets, strict=True)]
    rows = []
    for column, label in enumerate(labels):
        total = math.fsum(
            residual * row[column] for residual, row in zip(residuals, design, strict=True)
        )
        rows.append(
            f"${label}$ & $\\sum_i(p_i-y_i)\\,{label}$ & "
            f"${compact_magnitude_tex(abs(total))}$ \\\\"
        )
    return "\n".join(rows)


def contour_polygon(
    level: float,
    centre: tuple[float, float],
    intercept: float,
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
    *,
    steps: int = 48,
    reach: float = 6.0,
) -> list[tuple[float, float]]:
    """Ligne de niveau exacte de J dans le plan (w_pot, w_vol), a w_0 fige.

    J y est strictement convexe et minimale au centre : chaque rayon issu du
    centre coupe la ligne de niveau une fois et une seule, ce qu'une bissection
    localise a la precision voulue. Aucune approximation quadratique.
    """
    def value(radius: float, angle: float) -> float:
        weights = (
            intercept,
            centre[0] + radius * math.cos(angle),
            centre[1] + radius * math.sin(angle),
        )
        return mean_loss(weights, design, targets) - level

    polygon = []
    for index in range(steps):
        angle = 2.0 * math.pi * index / steps
        low, high = 0.0, reach
        if value(high, angle) < 0.0:
            raise AssertionError(f"niveau {level} hors de portee a l'angle {angle}")
        for _ in range(60):
            middle = 0.5 * (low + high)
            if value(middle, angle) < 0.0:
                low = middle
            else:
                high = middle
        radius = 0.5 * (low + high)
        polygon.append(
            (centre[0] + radius * math.cos(angle), centre[1] + radius * math.sin(angle))
        )
    polygon.append(polygon[0])
    return polygon


def slice_gradient(
    point: tuple[float, float],
    intercept: float,
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
) -> tuple[float, float]:
    """Gradient de J restreint au plan (w_pot, w_vol)."""
    full = gradient((intercept, point[0], point[1]), design, targets)
    return full[1], full[2]


def loss_curve_expression(
    weights: Sequence[float],
    design: Sequence[Sequence[float]],
    targets: Sequence[int],
) -> str:
    """J(t) le long du rayon w = t w*, ecrit pour pgfplots.

    softplus(a) - y a vaut ln(1+e^{-a}) quand y = 1 et ln(1+e^{a}) quand y = 0 :
    chaque eleve apporte donc un terme de meme forme, au signe du score pres.
    """
    terms = [
        f"ln(1+exp({-dot(weights, row) if target else dot(weights, row):+.6f}*x))"
        for row, target in zip(design, targets, strict=True)
    ]
    return f"({'+'.join(terms)})/{len(targets)}"


# Geometrie du nuage de la planche "Distribution des notes". Le style rawcloud
# emploie "scale only axis", donc la boite de cette planche vaut exactement
# 7,15 cm sur 5,72 cm, soit 203,4 x 162,8 points pour Potions dans [0,20] et Vol
# dans [0,100]. Ce rapport de 1,25 est ce qui rend les deux groupes ronds a
# l'ecran plutot qu'etires.
# Les etiquettes sont posees par recherche de position, jamais a la main : un
# changement de note deplace automatiquement le nom qui va avec.
PLOT_WIDTH_PT = 203.4
PLOT_HEIGHT_PT = 162.8
POTIONS_MAX = 20.0
VOL_MAX = 100.0
CHAR_WIDTH_PT = 3.3
LABEL_PADDING_PT = 2.4
LABEL_HEIGHT_PT = 7.4
MARKER_HALF_PT = 3.6
CANDIDATE_RADII = (7.5, 10.0, 13.0, 17.0, 21.0)
CANDIDATE_ANGLES = tuple(range(0, 360, 15))


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
        # Une etiquette lointaine devient ambigue : le rayon coute cher.
        penalty = 0.75 * radius
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
        first_name = tex_escape(student.name.split()[0])
        labels.append(
            rf"\node[font=\tiny\bfseries,text={house_color(student.house)},"
            rf"fill=white,fill opacity=.82,"
            rf"text opacity=1,inner sep=.6pt,xshift={xshift}pt,yshift={yshift}pt] "
            rf"at (axis cs:{student.potions:g},{student.flight:g}) {{{first_name}}};"
        )
    return "\n".join(labels)


def tex_wrong_side_labels(students: Sequence[Student]) -> str:
    """Etiquettes des eleves du mauvais cote, posees par le meme placeur."""
    shifts = place_labels(students)
    labels = []
    for student in students:
        xshift, yshift = shifts[student.ident]
        labels.append(
            rf"\node[font=\scriptsize\bfseries,text=warning,fill=white,"
            rf"fill opacity=.85,text opacity=1,inner sep=1pt,"
            rf"xshift={xshift}pt,yshift={yshift}pt] "
            rf"at (axis cs:{student.potions:g},{student.flight:g}) "
            rf"{{{tex_escape(student.name.split()[0])}}};"
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
    by_id = {student.ident: student for student in students}

    train_design = [design_row(student, potions, flight) for student in train]
    targets = [student.y for student in train]
    slope, intercept = boundary_line(raw_optimum)
    intercept_high = (
        math.log(THRESHOLDS[1] / (1.0 - THRESHOLDS[1])) - raw_optimum[0]
    ) / raw_optimum[2]
    raw_score_tex = (
        f"z={decimal_tex(raw_optimum[0], signed=True)}"
        f"{decimal_tex(raw_optimum[1], signed=True)}\\,P"
        f"{decimal_tex(raw_optimum[2], signed=True)}\\,V"
    )
    harry = design_row(by_id["E01"], potions, flight)

    # Coefficients d'essai : cinq profils contrastes suffisent aux planches.
    showcase = [by_id[ident] for ident in ("E01", "E02", "E03", "E12", "E07")]
    trial_scores = {
        student.ident: dot(TRIAL_WEIGHTS, design_row(student, potions, flight))
        for student in train
    }
    trial_losses = {
        student.ident: softplus(trial_scores[student.ident])
        - student.y * trial_scores[student.ident]
        for student in train
    }
    trial_loss = math.fsum(trial_losses.values()) / len(train)
    trial_agree = sum(
        1 for student in train
        if (trial_scores[student.ident] > 0.0) == bool(student.y)
    )
    # Un profil dont le signe concorde, un dont il s'oppose : Harry et Hermione.
    trial_best = by_id["E01"]
    trial_worst = by_id["E03"]
    trial_best_score = trial_scores[trial_best.ident]
    trial_best_loss = trial_losses[trial_best.ident]
    trial_worst_score = trial_scores[trial_worst.ident]
    trial_worst_loss = trial_losses[trial_worst.ident]

    # Point de depart de la descente : tous les p valent 1/2, donc p - y = 1/2 - y.
    zero_gradient = gradient((0.0, 0.0, 0.0), train_design, targets)
    zero_sums = tuple(value * len(train) for value in zero_gradient)
    first_step = tuple(-value * gd_alpha for value in zero_gradient)
    loss_at_zero = mean_loss((0.0, 0.0, 0.0), train_design, targets)
    loss_after_step = mean_loss(first_step, train_design, targets)

    wrong_side = [
        item.student for item in train_calculations
        if (item.score > 0.0) != bool(item.student.y)
    ]
    wrong_side_names = ", ".join(
        tex_escape(student.name.split()[0]) for student in wrong_side
    )
    # Les eleves d'evaluation que le passage d'un seuil a l'autre fait basculer.
    threshold_band = [
        item.student for item in test_calculations
        if THRESHOLDS[0] <= item.probability < THRESHOLDS[1]
    ]

    # Paysage de la perte dans le plan des deux poids, a ordonnee a l'origine
    # figee : c'est ce relief qui rend lisibles la direction du gradient et la
    # suite des pas de la descente.
    slice_centre = (standardized_optimum[1], standardized_optimum[2])
    slice_intercept = standardized_optimum[0]
    # Niveaux calibres sur le segment qui joint l'optimum au point de depart de
    # la descente : les quatre lignes se repartissent donc regulierement sur le
    # trajet effectivement parcouru, quelle que soit l'echelle du probleme.
    contour_levels = [
        mean_loss(
            (slice_intercept, slice_centre[0] * (1.0 - share), slice_centre[1] * (1.0 - share)),
            train_design,
            targets,
        )
        for share in (0.42, 0.30, 0.20, 0.12)
    ]
    contours = [
        contour_polygon(level, slice_centre, slice_intercept, train_design, targets)
        for level in contour_levels
    ]
    # Le gradient est lu sur un iteré de la descente elle-meme : la fleche part
    # donc d'un point que la planche voisine montre parcouru.
    probe = (gd_trace[2][2][1], gd_trace[2][2][2])
    probe_slope = slice_gradient(probe, slice_intercept, train_design, targets)
    probe_norm = math.hypot(*probe_slope)
    arrow_tip = (
        probe[0] - 0.36 * probe_slope[0] / probe_norm,
        probe[1] - 0.36 * probe_slope[1] / probe_norm,
    )
    # La fenetre epouse le trajet de la descente ; les lignes de niveau qui la
    # debordent sont rognees par la boite, comme sur toute carte de relief.
    span_x = ([weights[1] for _, _, weights, _ in gd_trace]
              + [0.0] + [x for x, _ in contours[0]])
    span_y = ([weights[2] for _, _, weights, _ in gd_trace]
              + [0.0] + [y for _, y in contours[0]])

    # Trois regimes de perte : classement correct et net, correct mais proche du
    # seuil, incorrect. Ils sont lus dans les calculs, jamais choisis a la main.
    cheapest = min(train_calculations, key=lambda item: item.loss)
    costliest = max(train_calculations, key=lambda item: item.loss)
    borderline = min(train_calculations, key=lambda item: abs(item.probability - 0.5))

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
        command("MicroNTotal", str(len(train) + len(test))),
        command("MicroTrainGryffondor", str(train_gryffondor)),
        command("MicroTrainSerpentard", str(len(train) - train_gryffondor)),
        command("MicroMedianPotions", decimal_tex(MEDIAN_POTIONS, trim=True)),
        command("MicroMedianVol", decimal_tex(MEDIAN_VOL, trim=True)),
        command("MicroMeanPotions", decimal_tex(potions.mean, trim=True)),
        command("MicroMeanVol", decimal_tex(flight.mean, trim=True)),
        command("MicroSdPotions", decimal_tex(potions.sd_population, trim=True)),
        command("MicroSdVol", decimal_tex(flight.sd_population, trim=True)),
        command("MicroImputedStdPotions", decimal_tex(
            (MEDIAN_POTIONS - potions.mean) / potions.sd_population, trim=True)),
        command("MicroImputedStdVol", decimal_tex(
            (MEDIAN_VOL - flight.mean) / flight.sd_population, trim=True)),
        command("MicroTrainCovariance", decimal_tex(COVARIANCE, trim=True)),
        command("MicroTrainCorrelation", CORRELATION_TEX),
        command("MicroTotalStudents", str(len(students))),
        command("MicroWDecimal", vector_tex(standardized_optimum)),
        command("MicroRawBetaDecimal", vector_tex(raw_optimum)),
        command("MicroRawScore", raw_score_tex),
        command("MicroBoundaryRaw", boundary_tex(slope, intercept)),
        command("MicroBoundarySlope", plain(slope)),
        command("MicroBoundaryIntercept", plain(intercept)),
        command("MicroBoundaryInterceptHigh", plain(intercept_high)),
        command("MicroBoundaryShift", decimal_tex(intercept_high - intercept, 3)),
        command("MicroHarryPotions", decimal_tex(harry[1], 2, signed=True)),
        command("MicroHarryVol", decimal_tex(harry[2], 2, signed=True)),
        command("MicroPotionsMin", f"{min(s.potions for s in students):g}"),
        command("MicroPotionsMax", f"{max(s.potions for s in students):g}"),
        command("MicroVolMin", f"{min(s.flight for s in students):g}"),
        command("MicroVolMax", f"{max(s.flight for s in students):g}"),
        command("MicroTrialWeights", TRIAL_TEX),
        command("MicroTrialScore", TRIAL_SCORE_TEX),
        command("MicroTrialRows", "\n" + trial_rows(showcase, potions, flight)),
        command("MicroTrialProbabilityRows",
                "\n" + trial_probability_rows(showcase, potions, flight)),
        command("MicroTrialLoss", decimal_tex(trial_loss)),
        command("MicroTrialAgree", str(trial_agree)),
        command("MicroTrialDisagree", str(len(train) - trial_agree)),
        command("MicroTrialBestName", tex_escape(trial_best.name.split()[0])),
        command("MicroTrialBestScore", decimal_tex(trial_best_score, 2, signed=True)),
        command("MicroTrialBestLoss", decimal_tex(trial_best_loss, 3)),
        command("MicroTrialWorstName", tex_escape(trial_worst.name.split()[0])),
        command("MicroTrialWorstScore", decimal_tex(trial_worst_score, 2, signed=True)),
        command("MicroTrialWorstLoss", decimal_tex(trial_worst_loss, 3)),
        command("MicroTrialLossRatio", f"{trial_worst_loss / trial_best_loss:.0f}"),
        command("MicroResidualRows", "\n" + residual_rows(showcase, potions, flight)),
        command("MicroGradientZero", vector_tex(zero_gradient)),
        command("MicroGradientZeroSumOne", decimal_tex(zero_sums[0], 4, signed=True)),
        command("MicroGradientZeroSumPotions", decimal_tex(zero_sums[1], 4, signed=True)),
        command("MicroGradientZeroSumVol", decimal_tex(zero_sums[2], 4, signed=True)),
        command("MicroFirstStep", vector_tex(first_step)),
        command("MicroLossAtZero", decimal_tex(loss_at_zero)),
        command("MicroLossAfterStep", decimal_tex(loss_after_step)),
        command("MicroCheapName", tex_escape(cheapest.student.name.split()[0])),
        command("MicroCheapProbability", decimal_tex(cheapest.probability, 4)),
        command("MicroCheapLoss", decimal_tex(cheapest.loss, 4)),
        command("MicroBorderName", tex_escape(borderline.student.name.split()[0])),
        command("MicroBorderProbability", decimal_tex(borderline.probability, 4)),
        command("MicroBorderLoss", decimal_tex(borderline.loss, 4)),
        command("MicroExpensiveName", tex_escape(costliest.student.name.split()[0])),
        command("MicroExpensiveProbability", decimal_tex(costliest.probability, 4)),
        command("MicroExpensiveLoss", decimal_tex(costliest.loss, 4)),
        command("MicroFirstOrderRows", "\n" + first_order_rows(
            standardized_optimum, train_design, targets)),
        command("MicroLossCurveExpr", loss_curve_expression(
            standardized_optimum, train_design, targets)),
        command("MicroWrongSideNames", wrong_side_names),
        command("MicroWrongSideCount", str(len(wrong_side))),
        command("MicroWrongSideLabels", "\n" + tex_wrong_side_labels(wrong_side)),
        command("MicroThresholdBandLabels", "\n" + tex_wrong_side_labels(threshold_band)),
        command("MicroTrainLoss", decimal_tex(train_loss)),
        command("MicroTrainLossPlain", plain(train_loss)),
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
        command("MicroTrainTP", str(metrics[("apprentissage", 0.50)].tp)),
        command("MicroTrainFN", str(metrics[("apprentissage", 0.50)].fn)),
        command("MicroTrainFP", str(metrics[("apprentissage", 0.50)].fp)),
        command("MicroTrainTN", str(metrics[("apprentissage", 0.50)].tn)),
        command("MicroTestTP", str(test_at_half.tp)),
        command("MicroTestFN", str(test_at_half.fn)),
        command("MicroTestFP", str(test_at_half.fp)),
        command("MicroTestTN", str(test_at_half.tn)),
        command("MicroTestTPHigh", str(metrics[("test", 0.65)].tp)),
        command("MicroTestFNHigh", str(metrics[("test", 0.65)].fn)),
        command("MicroTestFPHigh", str(metrics[("test", 0.65)].fp)),
        command("MicroTestTNHigh", str(metrics[("test", 0.65)].tn)),
        command("MicroTestCorrect", str(test_at_half.tp + test_at_half.tn)),
        command("MicroTrainConfusion", metric_text(metrics[("apprentissage", 0.50)])),
        command("MicroTestConfusion", metric_text(metrics[("test", 0.50)])),
        command("MicroTestConfusionTauHigh", metric_text(metrics[("test", 0.65)])),
        command("MicroTrainRows", "\n" + tex_dataset_rows(train, raw=True)),
        command("MicroTrainPreparedRows", "\n" + tex_dataset_rows(train, raw=False)),
        command("MicroTestRawRows", "\n" + tex_dataset_rows(test, raw=True)),
        command("MicroTestPreparedRows", "\n" + tex_dataset_rows(test, raw=False)),
        command("MicroCompactRows", "\n" + tex_compact_rows(students)),
        # Vignettes de la planche d'ensemble : chacune trace les valeurs reelles
        # de l'etape qu'elle annonce, jamais une courbe d'illustration.
        command("MicroSigmoidGryffondorCoords", pair_list(
            (item.score, item.probability) for item in train_calculations if item.student.y)),
        command("MicroSigmoidSerpentardCoords", pair_list(
            (item.score, item.probability) for item in train_calculations if not item.student.y)),
        command("MicroDecisionGryffondorCoords", pair_list(
            (item.probability, 0.66) for item in train_calculations if item.student.y)),
        command("MicroDecisionSerpentardCoords", pair_list(
            (item.probability, 0.34) for item in train_calculations if not item.student.y)),
        command("MicroGDPathCoords", pair_list(
            (weights[1], weights[2]) for _, _, weights, _ in gd_trace)),
        command("MicroOptimumCoords", pair_list([slice_centre])),
        command("MicroContourOuter", pair_list(contours[0])),
        command("MicroContourThird", pair_list(contours[1])),
        command("MicroContourSecond", pair_list(contours[2])),
        command("MicroContourInner", pair_list(contours[3])),
        command("MicroGradientProbe", pair_list([probe])),
        command("MicroGradientProbeX", plain(probe[0])),
        command("MicroGradientProbeY", plain(probe[1])),
        command("MicroGradientTipX", plain(arrow_tip[0])),
        command("MicroGradientTipY", plain(arrow_tip[1])),
        command("MicroSliceXmin", plain(min(span_x) - 0.08, 3)),
        command("MicroSliceXmax", plain(max(span_x) + 0.08, 3)),
        command("MicroSliceYmin", plain(min(span_y) - 0.06, 3)),
        command("MicroSliceYmax", plain(max(span_y) + 0.06, 3)),
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
        command("MicroProbabilityOlivier", decimal_tex(calculations_by_id["E22"].probability)),
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
    standardized_optimum = newton_optimum(train_design, targets)
    raw_optimum = raw_coefficients(standardized_optimum, potions, flight)
    optimum_gradient = gradient(standardized_optimum, train_design, targets)
    if max(abs(value) for value in optimum_gradient) > 2e-15:
        raise AssertionError(f"gradient non nul a l'optimum: {optimum_gradient}")

    # Le recouvrement des deux maisons rend l'optimum fini : sans au moins une
    # observation mal classee de chaque cote, la perte tendrait vers zero et les
    # coefficients divergeraient.
    wrong_side = {
        student.ident
        for student, row in zip(train, train_design, strict=True)
        if (dot(standardized_optimum, row) > 0.0) != bool(student.y)
    }
    if len({student.y for student in train if student.ident in wrong_side}) != 2:
        raise AssertionError(
            "les deux maisons doivent chacune fournir un eleve du mauvais cote; "
            f"observe: {sorted(wrong_side)}"
        )

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
        ("apprentissage", 0.65): (9, 3, 2, 6),
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
