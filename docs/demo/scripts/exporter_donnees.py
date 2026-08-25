#!/usr/bin/env python3
"""Exporte le jeu de l'atelier vers un module JavaScript.

La source est data/scenario.csv, produit par construire_scenario.py. Le
protocole reproduit celui de logreg_train.py : médiane des valeurs présentes du
groupe d'apprentissage pour combler les absences, puis moyenne et écart type de
population sur les colonnes complétées. Les statistiques ignorent le groupe
d'évaluation.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SOURCE = HERE / "data" / "scenario.csv"
OUTPUT = HERE / "src" / "data.js"

ALPHA = 1.0
POSITIVE = "Gryffondor"
COURSES = ["potions", "vol"]
LABELS = {"potions": "Potions", "vol": "Vol"}
MAX = {"potions": 20, "vol": 100}


def median(values: list[float]) -> float:
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def mean(values: list[float]) -> float:
    return sum(values) / len(values)


def population_sd(values: list[float]) -> float:
    average = mean(values)
    return (sum((value - average) ** 2 for value in values) / len(values)) ** 0.5


def collect(source: Path) -> dict:
    with source.open(encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle, delimiter=";"))

    train = [row for row in rows if row["usage"].strip() == "apprentissage"]
    test = [row for row in rows if row["usage"].strip() == "test"]

    def column(subset, name):
        out = []
        for row in subset:
            text = row[name].strip()
            out.append(float(text) if text else None)
        return out

    stats = {}
    for name in COURSES:
        present = [value for value in column(train, name) if value is not None]
        med = median(present)
        filled = [med if value is None else value for value in column(train, name)]
        stats[name] = {
            "median": round(med, 4),
            "mu": round(mean(filled), 4),
            "sd": round(population_sd(filled), 4),
            "max": MAX[name],
            "label": LABELS[name],
        }

    def build(subset, usage):
        out = []
        for row in subset:
            raw, x, imputed = [], [], []
            for name in COURSES:
                text = row[name].strip()
                missing = text == ""
                value = stats[name]["median"] if missing else float(text)
                raw.append(round(value, 4))
                imputed.append(missing)
                x.append(round((value - stats[name]["mu"]) / stats[name]["sd"], 6))
            out.append({
                "id": row["id"],
                "name": row["eleve"].split()[0],
                "full": row["eleve"],
                "house": row["maison"],
                "y": 1 if row["maison"] == POSITIVE else 0,
                "usage": usage,
                "raw": raw,
                "x": x,
                "imputed": imputed,
            })
        return out

    return {
        "alpha": ALPHA,
        "positive": POSITIVE,
        "negative": next(row["maison"] for row in rows if row["maison"] != POSITIVE),
        "courses": COURSES,
        "stats": stats,
        "train": build(train, "apprentissage"),
        "test": build(test, "evaluation"),
    }


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"{SOURCE} absent : lancer construire_scenario.py")

    payload = collect(SOURCE)
    positives = sum(student["y"] for student in payload["train"])
    print(f"{len(payload['train'])} élèves d'apprentissage ({positives} {POSITIVE}), {len(payload['test'])} d'évaluation")

    OUTPUT.write_text(
        "// Fichier généré par scripts/exporter_donnees.py, ne pas éditer.\n"
        "export const DATA = " + json.dumps(payload, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"{OUTPUT}")


if __name__ == "__main__":
    main()
