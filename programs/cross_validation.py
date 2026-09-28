#!/usr/bin/env python3

import sys

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from dslr.analysis import accuracy, confusion, folds, scores
from dslr.data import HOUSE, HOUSES, houses, load
from dslr.model import REQUIRED, fit_scaler, predict, train, transform
from dslr.plots import confusion_figure, show

K = 5


def fit_and_predict(training: pd.DataFrame, validation: pd.DataFrame) -> np.ndarray:
    scaler = fit_scaler(training)
    weights, _ = train(transform(training, scaler), training[HOUSE])
    return predict(transform(validation, scaler), weights)


def main(path: str) -> None:
    df = load(path, REQUIRED)
    houses(df)
    parts = folds(df, K)

    truth = []
    predicted = []
    print("fold  students  accuracy")
    for i, validation in enumerate(parts):
        training = pd.concat(parts[:i] + parts[i + 1:])
        guess = fit_and_predict(training, validation)

        matrix = confusion(validation[HOUSE], guess, HOUSES)
        print(f"{i + 1:>4}  {len(validation):>8}  {accuracy(matrix):>8.4f}")

        truth.extend(validation[HOUSE])
        predicted.extend(guess)

    matrix = confusion(truth, predicted, HOUSES)
    print()
    print(scores(matrix).to_string(float_format="%.2f"))
    print(f"\naccuracy  {accuracy(matrix):.4f}  on {len(truth)} students")

    confusion_figure(matrix)
    show()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(f"usage: {sys.argv[0]} dataset_train.csv")
    try:
        main(sys.argv[1])
    except (OSError, ValueError) as e:
        sys.exit(f"erreur: {e}")
    except KeyboardInterrupt:
        plt.close("all")
        print("\nCTRL+C")
        sys.exit(130)
