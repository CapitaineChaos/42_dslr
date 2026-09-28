#!/usr/bin/env python3

import sys

import matplotlib.pyplot as plt

from dslr.analysis import accuracy, confusion, scores
from dslr.data import HOUSE, HOUSES, houses, load
from dslr.plots import confusion_figure

INDEX = "Index"


def main(preds_csv: str, truth_csv: str) -> None:
    preds = load(preds_csv, [INDEX, HOUSE])
    truth = load(truth_csv, [INDEX, HOUSE])
    houses(preds)
    houses(truth)

    if set(preds[INDEX]) != set(truth[INDEX]):
        raise ValueError(f"{preds.attrs['name']} and {truth.attrs['name']} do not hold the same students")

    # Aligne chaque prédiction sur la vérité du même élève
    pairs = truth[[INDEX, HOUSE]].merge(preds[[INDEX, HOUSE]], on=INDEX, suffixes=("_truth", "_pred"))
    matrix = confusion(pairs[f"{HOUSE}_truth"], pairs[f"{HOUSE}_pred"], HOUSES)

    print(scores(matrix).to_string(float_format="%.2f"))
    print(f"\naccuracy  {accuracy(matrix):.4f}  on {len(pairs)} students")

    confusion_figure(matrix)
    plt.show()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(f"usage: {sys.argv[0]} houses.csv validation.csv")
    try:
        main(sys.argv[1], sys.argv[2])
    except (OSError, ValueError) as e:
        sys.exit(f"erreur: {e}")
    except KeyboardInterrupt:
        plt.close("all")
        print("\nCTRL+C")
        sys.exit(130)
