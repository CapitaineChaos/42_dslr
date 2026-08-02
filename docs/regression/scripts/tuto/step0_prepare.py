import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'V.0_Common'))
from dataset import Data

TRAIN = os.path.join(ROOT, 'datasets', 'dataset_train.csv')
COURSES = ["Herbology", "Ancient Runes"]


def load():
    data = Data(TRAIN)
    return [data.courses[course] for course in COURSES], data.houses


def fit_stats(columns, rows):
    stats = []
    for col in columns:
        known = sorted(col[i] for i in rows if col[i] is not None)
        lo, hi = known[(len(known) - 1) // 2], known[len(known) // 2]
        median = (lo + hi) / 2
        filled = [col[i] if col[i] is not None else median for i in rows]
        mean = sum(filled) / len(filled)
        sd = (sum((v - mean) ** 2 for v in filled) / len(filled)) ** 0.5
        stats.append((median, mean, sd))
    return stats


def design(columns, stats, rows):
    X = []
    for row in rows:
        line = [1.0]
        for col, (median, mean, sd) in zip(columns, stats):
            value = col[row] if col[row] is not None else median
            line.append((value - mean) / sd)
        X.append(line)
    return X


if __name__ == "__main__":
    columns, houses = load()
    rows = list(range(len(houses)))
    stats = fit_stats(columns, rows)
    X = design(columns, stats, rows)
    for course, (median, mean, sd) in zip(COURSES, stats):
        print(f"{course:<14} median {median:>10.3f}  mean {mean:>10.3f}"
              f"  sd {sd:>9.3f}")
    print(f"{len(X)} students, {len(X[0])} columns (bias included)")
    print("student 3:", [round(v, 3) for v in X[3]])
