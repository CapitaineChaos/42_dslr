#!/usr/bin/env python3

import sys

import matplotlib.pyplot as plt

from dslr.analysis import eta_squared
from dslr.data import houses, load
from dslr.plots import detail

# η² le plus faible des 13 matières : la maison explique 0,07 % de la variance
HOMOGENEOUS = "Arithmancy"


def main(path: str) -> None:
    df = load(path, [HOMOGENEOUS])
    houses(df)
    detail(df, HOMOGENEOUS, HOMOGENEOUS)
    eta = eta_squared(df, [HOMOGENEOUS])[HOMOGENEOUS]
    plt.gca().set_title(f"η² = {eta:.4f}")
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
