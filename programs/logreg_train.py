#!/usr/bin/env python3

import sys

from dslr.data import houses, load
from dslr.model import EPSILON, MAX_ITER, REQUIRED, fit_scaler, save, train, transform

WEIGHTS = "weights.csv"


def main(path: str) -> None:
    df = load(path, REQUIRED)
    labels = houses(df)

    scaler = fit_scaler(df)
    x = transform(df, scaler)
    print(f"X is {x.shape[0]} x {x.shape[1]}")

    weights, report = train(x, labels)
    for house, (cost, norm, iteration) in report.items():
        print(f"  {house:<12} cost {cost:.4f}  gradient {norm:.3e}  {iteration:>5} iterations")
    for house, (_, norm, _) in report.items():
        if norm >= EPSILON:
            print(f"warning: {house}: stopped at {MAX_ITER} iterations, gradient {norm:.1e} >= {EPSILON:g}", file=sys.stderr)

    save(WEIGHTS, scaler, weights)
    print(f"model written to {WEIGHTS}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(f"usage: {sys.argv[0]} dataset_train.csv")
    try:
        main(sys.argv[1])
    except (OSError, ValueError) as e:
        sys.exit(f"erreur: {e}")
    except KeyboardInterrupt:
        print("\nCTRL+C")
        sys.exit(130)
