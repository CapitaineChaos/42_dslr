#!/usr/bin/env python3
"""Valide et calcule le micro-cas Gryffondor--Serpentard.

Le CSV est l'unique source de donnees. Le script impute et standardise a partir
des douze observations d'apprentissage seulement, verifie l'optimum analytique
de la regression logistique, execute une descente de gradient de pas 1, puis
regenere les artefacts internes du diaporama.
"""

from __future__ import annotations

import csv
import math
import statistics
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "micro_ecoles.csv"
CALCULATIONS = ROOT / "data" / "micro_ecoles_calculs.csv"
TEX_VALUES = ROOT / "regression_logistique_slides_values.tex"

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
ATYPIQUES = {"E07", "E08", "E18"}
MISSING = {("E13", "potions"), ("E14", "flight")}
THRESHOLDS = (0.50, 0.65)


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
    def school(self) -> str:
        """Alias interne conserve pour les routines de calcul generiques."""
        return self.house

    @property
    def maths(self) -> float:
        return self.potions

    @property
    def french(self) -> float:
        return self.flight


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
    z_maths: float
    z_french: float
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

    if len(rows) != 20:
        raise ValueError(f"le CSV doit contenir 20 eleves, pas {len(rows)}")

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
        potions = parse_grade(row["potions"], ident, "potions", 20.0)
        flight = parse_grade(row["vol"], ident, "vol", 100.0)
        parsed.append(
            {
                "ident": ident,
                "name": name,
                "house": house,
                "potions": potions,
                "flight": flight,
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
    if any(record[field] is None for record in train_records for field in ("potions", "flight")):
        raise ValueError("les parametres d'imputation exigent un apprentissage complet")
    median_potions = statistics.median(float(record["potions"]) for record in train_records)
    median_flight = statistics.median(float(record["flight"]) for record in train_records)
    if not close(median_potions, 10.0) or not close(median_flight, 50.0):
        raise AssertionError("les medianes d'apprentissage attendues valent 10 et 50")

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
    if {student.ident for student in students if student.atypical} != ATYPIQUES:
        raise ValueError("les lignes atypiques doivent etre E07, E08 et E18")
    if [student.usage for student in students[:12]] != ["apprentissage"] * 12:
        raise ValueError("E01 a E12 doivent constituer l'apprentissage")
    if [student.usage for student in students[12:]] != ["test"] * 8:
        raise ValueError("E13 a E20 doivent constituer le test")
    for usage, expected in (("apprentissage", 12), ("test", 8)):
        subset = [student for student in students if student.usage == usage]
        if len(subset) != expected:
            raise ValueError(f"{usage}: {len(subset)} lignes au lieu de {expected}")
        if sum(student.y for student in subset) * 2 != expected:
            raise ValueError(f"{usage}: les deux maisons doivent etre equilibrees")
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


def design_row(student: Student, maths: ColumnStats, french: ColumnStats) -> tuple[float, ...]:
    return (
        1.0,
        (student.maths - maths.mean) / maths.sd_population,
        (student.french - french.mean) / french.sd_population,
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
    raw_margin = lambda student: student.flight - 3.0 * student.potions - 20.0
    positive_side = [student for student in train if raw_margin(student) > 0.0]
    negative_side = [student for student in train if raw_margin(student) < 0.0]
    if len(positive_side) != 6 or len(negative_side) != 6:
        raise AssertionError("le train doit comporter six points de chaque cote")
    gaps = {abs(raw_margin(student)) for student in train}
    if gaps != {18.0}:
        raise AssertionError(f"les marges brutes attendues valent toutes 18, obtenu {gaps}")
    counts = (
        sum(student.y for student in positive_side),
        len(positive_side) - sum(student.y for student in positive_side),
        sum(student.y for student in negative_side),
        len(negative_side) - sum(student.y for student in negative_side),
    )
    if counts != (5, 1, 1, 5):
        raise AssertionError(f"table de contingence inattendue: {counts}")

    # Le score de Vol est la transformation 3*F+20 du micro-cas latent. Chaque
    # niveau moyen (P+F)/2 porte les deux maisons : seule la marge
    # V-3P-20 intervient. Sur une marge +18, p=5/6 et logit(p)=ln(5).
    by_average: dict[float, list[Student]] = {}
    for student in train:
        latent_flight = (student.flight - 20.0) / 3.0
        by_average.setdefault((student.potions + latent_flight) / 2.0, []).append(student)
    if any(
        len(pair) != 2 or {student.y for student in pair} != {0, 1}
        for pair in by_average.values()
    ):
        raise AssertionError("chaque niveau moyen doit porter les deux classes")

    margin_slope = math.log(counts[0] / counts[1]) / 18.0
    raw = (-20.0 * margin_slope, -3.0 * margin_slope, margin_slope)
    standardized_slope = 2.0 * math.log(5.0) / 3.0
    standardized = (0.0, -standardized_slope, standardized_slope)
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
    snapshots = {0, 1, 2, 5, 10, 20, 50, 100, 200}
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
    maths: ColumnStats,
    french: ColumnStats,
    weights: Sequence[float],
) -> list[Calculation]:
    calculations: list[Calculation] = []
    for student in students:
        row = design_row(student, maths, french)
        score = dot(weights, row)
        probability = sigmoid(score)
        calculations.append(
            Calculation(
                student=student,
                z_maths=row[1],
                z_french=row[2],
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
        "(" + decimal_tex((student.potions - potions.mean) / potions.sd_population, 4, trim=True).replace("{,}", ".")
        + "," + decimal_tex((student.flight - flight.mean) / flight.sd_population, 4, trim=True).replace("{,}", ".") + ")"
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


LABEL_OFFSETS = {
    "E01": (-9, 7), "E02": (-6, -8), "E03": (-12, 8), "E04": (-9, -8),
    "E05": (10, 9), "E06": (11, -7), "E07": (-11, -9), "E08": (-14, 10),
    "E09": (13, 11), "E10": (-11, 10), "E11": (0, 10), "E12": (13, 10),
    "E13": (16, -4), "E14": (14, -9), "E15": (-11, -9), "E16": (-11, -9),
    "E17": (12, 10), "E18": (-17, -9), "E19": (-10, -9), "E20": (14, -8),
}


def tex_all_labels(students: Iterable[Student]) -> str:
    labels = []
    for student in students:
        xshift, yshift = LABEL_OFFSETS[student.ident]
        color = "coursescore!88!ink" if student.house == GRYFFONDOR else "warning!88!ink"
        first_name = tex_escape(student.name.split()[0])
        labels.append(
            rf"\node[font=\tiny\bfseries,text={color},fill=white,fill opacity=.82,"
            rf"text opacity=1,inner sep=.6pt,xshift={xshift}pt,yshift={yshift}pt] "
            rf"at (axis cs:{student.potions:g},{student.flight:g}) {{{first_name}}};"
        )
    return "\n".join(labels)


def metric_text(metric: Evaluation) -> str:
    return f"VP $={metric.tp}$, FN $={metric.fn}$, FP $={metric.fp}$, VN $={metric.tn}$"


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
                    "x_potions": csv_number(calculation.z_maths),
                    "x_vol": csv_number(calculation.z_french),
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
    maths: ColumnStats,
    french: ColumnStats,
    raw_optimum: Sequence[float],
    standardized_optimum: Sequence[float],
    gd_weights: Sequence[float],
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

    def command(name: str, value: str) -> str:
        return rf"\newcommand{{\{name}}}{{{value}}}"

    lines = [
        "% Fichier genere par scripts/build_micro_case.py ; ne pas modifier.",
        "% Les donnees brutes, l'imputation et les calculs sont controles par le generateur.",
        "",
        command("MicroGryffondorLabel", GRYFFONDOR),
        command("MicroSerpentardLabel", SERPENTARD),
        command("MicroNTrain", str(len(train))),
        command("MicroNTest", str(len(test))),
        command("MicroMedianPotions", "10"),
        command("MicroMedianVol", "50"),
        command("MicroMeanPotions", decimal_tex(maths.mean, trim=True)),
        command("MicroMeanVol", decimal_tex(french.mean, trim=True)),
        command("MicroSdPotions", decimal_tex(maths.sd_population, trim=True)),
        command("MicroSdVol", decimal_tex(french.sd_population, trim=True)),
        command("MicroTrainCorrelation", r"-\frac{1}{8}"),
        command("MicroExactLogOdds", r"\ln 5"),
        command("MicroExactProbabilityHigh", r"\frac{5}{6}"),
        command("MicroExactProbabilityLow", r"\frac{1}{6}"),
        command(
            "MicroW",
            r"\left(0\,;\,-\frac{2\ln 5}{3}\,;\,+\frac{2\ln 5}{3}\right)",
        ),
        command(
            "MicroWDecimal",
            r"\left(" + r"\,;\,".join(
                decimal_tex(value, signed=True) for value in standardized_optimum
            ) + r"\right)",
        ),
        command(
            "MicroRawBeta",
            r"\left(-\frac{10\ln 5}{9}\,;\,-\frac{\ln 5}{6}\,;\,+\frac{\ln 5}{18}\right)",
        ),
        command(
            "MicroRawBetaDecimal",
            r"\left(" + r"\,;\,".join(
                decimal_tex(value, signed=True) for value in raw_optimum
            ) + r"\right)",
        ),
        command("MicroTrainLoss", decimal_tex(train_loss)),
        command("MicroTestLoss", decimal_tex(test_loss)),
        command("MicroGDIterations", str(gd_iterations)),
        command(
            "MicroGDLoss",
            decimal_tex(
                mean_loss(
                    gd_weights,
                    [design_row(student, maths, french) for student in train],
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
        command("MicroTestAccuracy", decimal_tex(metrics[("test", 0.50)].accuracy, 4)),
        command("MicroTestAccuracyTauHigh", decimal_tex(metrics[("test", 0.65)].accuracy, 4)),
        command("MicroTestPrecision", decimal_tex(test_at_half.precision, 4)),
        command("MicroTestRecall", decimal_tex(test_at_half.recall, 4)),
        command("MicroTestSpecificity", decimal_tex(test_at_half.specificity, 4)),
        command("MicroTestFScore", decimal_tex(test_at_half.f1, 4)),
        command("MicroTestWilsonLow", decimal_tex(wilson_low, 6)),
        command("MicroTestWilsonHigh", decimal_tex(wilson_high, 6)),
        command("MicroTrainConfusion", metric_text(metrics[("apprentissage", 0.50)])),
        command("MicroTestConfusion", metric_text(metrics[("test", 0.50)])),
        command("MicroTestConfusionTauHigh", metric_text(metrics[("test", 0.65)])),
        command("MicroTrainRows", "\n" + tex_dataset_rows(train, raw=True)),
        command("MicroTestRawRows", "\n" + tex_dataset_rows(test, raw=True)),
        command("MicroTestPreparedRows", "\n" + tex_dataset_rows(test, raw=False)),
        command("MicroAllGryffondorCoords", coordinate_list(student for student in students if student.y == 1)),
        command("MicroAllSerpentardCoords", coordinate_list(student for student in students if student.y == 0)),
        command("MicroTrainGryffondorCoords", coordinate_list(student for student in train if student.y == 1)),
        command("MicroTrainSerpentardCoords", coordinate_list(student for student in train if student.y == 0)),
        command("MicroTestGryffondorCoords", coordinate_list(student for student in test if student.y == 1)),
        command("MicroTestSerpentardCoords", coordinate_list(student for student in test if student.y == 0)),
        command(
            "MicroTrainGryffondorStdCoords",
            standardized_coordinate_list(
                (student for student in train if student.y == 1), maths, french
            ),
        ),
        command(
            "MicroTrainSerpentardStdCoords",
            standardized_coordinate_list(
                (student for student in train if student.y == 0), maths, french
            ),
        ),
        command("MicroMissingCoords", coordinate_list(student for student in students if student.missing_potions or student.missing_flight)),
        command("MicroAllNameLabels", "\n" + tex_all_labels(students)),
        command("MicroTrainAtypicalCoords", coordinate_list(student for student in train if student.atypical)),
        command("MicroTestAtypicalCoords", coordinate_list(student for student in test if student.atypical)),
        command("MicroGDTableRows", "\n" + "\n".join(gd_rows)),
        command("MicroGradientCheckRows", "\n" + "\n".join(check_rows)),
        command("MicroMetricsRows", "\n" + "\n".join(metric_rows)),
        command("MicroTestSummaryRows", "\n" + "\n".join(test_summary_rows)),
        command("MicroTrainCalcRows", "\n" + tex_calculation_rows(train_calculations)),
        command("MicroTestCalcRows", "\n" + tex_calculation_rows(test_calculations)),
    ]
    calculations_by_id = {
        calculation.student.ident: calculation for calculation in calculations
    }
    lines.extend(
        [
            command(
                "MicroProbabilityLavande",
                decimal_tex(calculations_by_id["E17"].probability),
            ),
            command(
                "MicroProbabilityMarcus",
                decimal_tex(calculations_by_id["E18"].probability),
            ),
        ]
    )
    lines.append("")
    TEX_VALUES.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    students = read_students()
    train = [student for student in students if student.usage == "apprentissage"]
    maths = column_stats([student.maths for student in train])
    french = column_stats([student.french for student in train])

    expected_stats = {
        "potions": (maths, 10.0, 4.0),
        "vol": (french, 50.0, 12.0),
    }
    for label, (stats, expected_mean, expected_sd) in expected_stats.items():
        if not close(stats.mean, expected_mean) or not close(stats.sd_population, expected_sd):
            raise AssertionError(
                f"{label}: moyenne {expected_mean:g} et ecart-type {expected_sd:g} attendus"
            )
    centered_products = math.fsum(
        (student.maths - maths.mean) * (student.french - french.mean)
        for student in train
    )
    if not close(centered_products / len(train), -6.0):
        raise AssertionError("covariance population attendue: -6")

    train_design = [design_row(student, maths, french) for student in train]
    targets = [student.y for student in train]
    raw_optimum, standardized_optimum = exact_optimum(train)
    exact_gradient = gradient(standardized_optimum, train_design, targets)
    if max(abs(value) for value in exact_gradient) > 2e-15:
        raise AssertionError(f"gradient non nul a l'optimum exact: {exact_gradient}")

    gd_weights, gd_iterations, gd_trace = gradient_descent(train_design, targets, alpha=1.0)
    if max(abs(a - b) for a, b in zip(gd_weights, standardized_optimum, strict=True)) > 2e-10:
        raise AssertionError(
            f"la descente ne rejoint pas l'optimum exact: {gd_weights} != {standardized_optimum}"
        )

    probe = (0.2, -0.4, 0.3)
    gradient_checks = finite_difference_check(probe, train_design, targets)
    if max(row[3] for row in gradient_checks) > 2e-9:
        raise AssertionError(f"controle du gradient insuffisant: {gradient_checks}")

    calculations = calculate(students, maths, french, standardized_optimum)
    test_loss = math.fsum(
        calculation.loss
        for calculation in calculations
        if calculation.student.usage == "test"
    ) / 8.0
    if not close(test_loss, 0.457132522223, tolerance=1e-12):
        raise AssertionError(f"perte de test inattendue: {test_loss}")
    metrics: dict[tuple[str, float], Evaluation] = {}
    for usage in ("apprentissage", "test"):
        subset = [item for item in calculations if item.student.usage == usage]
        for index, threshold in enumerate(THRESHOLDS):
            metrics[(usage, threshold)] = evaluate(subset, index)

    expected_confusions = {
        ("apprentissage", 0.50): (5, 1, 1, 5),
        ("apprentissage", 0.65): (5, 1, 1, 5),
        ("test", 0.50): (4, 0, 1, 3),
        ("test", 0.65): (3, 1, 0, 4),
    }
    for key, expected in expected_confusions.items():
        metric = metrics[key]
        observed = (metric.tp, metric.fn, metric.fp, metric.tn)
        if observed != expected:
            raise AssertionError(f"{key}: confusion {observed}, attendu {expected}")

    write_calculations(calculations)
    write_tex_values(
        students,
        maths,
        french,
        raw_optimum,
        standardized_optimum,
        gd_weights,
        gd_iterations,
        gd_trace,
        gradient_checks,
        calculations,
        metrics,
    )
    print(
        f"{SOURCE.name}: {len(train)} apprentissage + {len(students) - len(train)} test; "
        f"mu=(10,50), sigma=(4,12); GD alpha=1 en {gd_iterations} tours"
    )
    print(f"{CALCULATIONS}: {len(calculations)} lignes calculees")
    print(f"{TEX_VALUES}: macros LaTeX regenerees")


if __name__ == "__main__":
    main()
