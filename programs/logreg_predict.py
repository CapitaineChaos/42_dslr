#!/usr/bin/env python3

import sys
from pathlib import Path

import pandas as pd

from dslr.data import HOUSE, load
from dslr.model import REQUIRED, predict, read_model, transform

INDEX = "Index"
HOUSES_CSV = "houses.csv"


def main(test_csv: str, weights_csv: str) -> None:
    df = load(test_csv, [INDEX] + REQUIRED)
    scaler, weights = read_model(weights_csv)

    guess = predict(transform(df, scaler), weights)

    out = Path(HOUSES_CSV)
    if out.is_symlink():
        raise OSError(f"{out.name}: symlink forbidden")
    pd.DataFrame({INDEX: df[INDEX], HOUSE: guess}).to_csv(out, index=False)
    print(f"{len(guess)} predictions written to {HOUSES_CSV}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(f"usage: {sys.argv[0]} dataset_test.csv weights.csv")
    try:
        main(sys.argv[1], sys.argv[2])
    except (OSError, ValueError) as e:
        sys.exit(f"erreur: {e}")
    except KeyboardInterrupt:
        print("\nCTRL+C")
        sys.exit(130)
