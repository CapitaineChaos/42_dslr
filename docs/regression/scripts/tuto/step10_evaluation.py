import os
import sys
from math import sqrt

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES

from step4_total_cost import load, fit_stats, design
from step8_four_houses import train, predict
from step9_holdout import split

Z = 1.959964


def wilson(right, total, z=Z):
    if total == 0:
        return 0.0, 1.0
    p, n = right / total, total
    half = z * sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    centre, spread = p + z * z / (2 * n), 1 + z * z / n
    return (centre - half) / spread, (centre + half) / spread


def confusion(model, X, observed):
    table = {a: {b: 0 for b in HOUSES} for a in HOUSES}
    for x, house in zip(X, observed):
        table[house][predict(model, x)] += 1
    return table


if __name__ == "__main__":
    columns, houses = load()
    learn, test = split(houses)
    stats = fit_stats(columns, learn)
    X_learn = design(columns, stats, learn)
    X_test = design(columns, stats, test)
    observed = [houses[i] for i in test]
    model = train(X_learn, [houses[i] for i in learn])

    table = confusion(model, X_test, observed)
    width = max(len(h) for h in HOUSES)
    print("\nconfusion matrix on the held-out students (rows: observed)")
    print(" " * (width + 2) + "".join(f"{h[:4]:>7}" for h in HOUSES) + "    total")
    for house in HOUSES:
        line = table[house]
        print(f"{house:<{width}}  " + "".join(f"{line[b]:>7}" for b in HOUSES)
              + f"{sum(line.values()):>9}")

    right = sum(table[h][h] for h in HOUSES)
    total = len(observed)
    low, high = wilson(right, total)
    print(f"\naccuracy {right}/{total} = {right / total:.4f}"
          f"   Wilson 95% [{low:.4f} ; {high:.4f}]")

    print("\nper class")
    print(f"{'house':<{width}}  {'recall':>8}{'precis.':>9}{'F1':>7}{'support':>9}")
    for house in HOUSES:
        tp = table[house][house]
        support = sum(table[house].values())
        predicted = sum(table[a][house] for a in HOUSES)
        recall = tp / support if support else 0.0
        precision = tp / predicted if predicted else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        print(f"{house:<{width}}  {recall:>8.4f}{precision:>9.4f}{f1:>7.4f}{support:>9}")

    biggest = max(HOUSES, key=observed.count)
    base = observed.count(biggest) / total
    print(f"\nbaseline, everyone into {biggest}: {base:.4f}")
