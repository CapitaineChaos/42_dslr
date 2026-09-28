#!/usr/bin/env python3

import sys

import matplotlib.pyplot as plt

from dslr.data import courses, houses, load
from dslr.plots import matrix


def main(path: str) -> None:
    df = load(path)
    houses(df)
    matrix(df, list(courses(df).columns), "Scatter plot matrix", lower_only=True)
    plt.show()


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
