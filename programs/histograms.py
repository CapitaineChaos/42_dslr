#!/usr/bin/env python3

import sys

import matplotlib.pyplot as plt

from dslr.analysis import eta_squared
from dslr.data import courses, houses, load
from dslr.plots import histograms, show


def main(path: str) -> None:
    df = load(path)
    houses(df)
    features = list(courses(df).columns)
    histograms(df, features, eta_squared(df, features))
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
