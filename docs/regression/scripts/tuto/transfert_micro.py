"""Micro-cas de transfert : douze pièces, deux mesures, une classe binaire.

Le jeu est volontairement minuscule et sans rapport avec le fil rouge : il sert
à réemployer la chaîne complète sur d'autres données, dans une autre unité.
"""
from step1_score import score_of
from step3_single_cost import student_cost
from step5_gradient import gradient

ALPHA = 1.0
EPSILON = 1e-6
MAX_TURNS = 6000

# diametre (mm), durete (HV), rebut (1) ou conforme (0)
PIECES = [
    (10.02, 121.0, 0), (10.05, 118.0, 0), (9.98, 124.0, 0),
    (10.01, 119.0, 0), (9.96, 127.0, 0), (10.07, 116.0, 0),
    (10.31, 143.0, 1), (10.28, 139.0, 1), (10.35, 147.0, 1),
    (9.71, 145.0, 1), (10.24, 136.0, 1), (9.68, 141.0, 1),
]


def fit_stats(columns):
    stats = []
    for col in columns:
        mean = sum(col) / len(col)
        sd = (sum((v - mean) ** 2 for v in col) / len(col)) ** 0.5
        stats.append((mean, sd))
    return stats


def design(columns, stats):
    rows = len(columns[0])
    return [[1.0] + [(col[i] - mean) / sd
                     for col, (mean, sd) in zip(columns, stats)]
            for i in range(rows)]


def total_cost(weights, X, target):
    return sum(student_cost(score_of(weights, x), y)
               for x, y in zip(X, target)) / len(X)


def descend(X, target):
    weights = [0.0] * len(X[0])
    previous = total_cost(weights, X, target)
    for turn in range(1, MAX_TURNS + 1):
        slopes = gradient(weights, X, target)
        weights = [w - ALPHA * g for w, g in zip(weights, slopes)]
        cost = total_cost(weights, X, target)
        if previous - cost < EPSILON * abs(previous):
            return weights, cost, turn, "stagnation"
        previous = cost
    return weights, previous, MAX_TURNS, "plafond"


if __name__ == "__main__":
    columns = [[p[0] for p in PIECES], [p[1] for p in PIECES]]
    target = [float(p[2]) for p in PIECES]
    stats = fit_stats(columns)
    X = design(columns, stats)

    for name, (mean, sd) in zip(("diametre", "durete"), stats):
        print(f"{name:<9} mean {mean:>8.4f}   sd {sd:>8.4f}")
    print("cost with zero weights:", round(total_cost([0.0] * 3, X, target), 6))

    weights, cost, turns, why = descend(X, target)
    print(f"stopped after {turns} iterations ({why}), cost {cost:.6f}")
    print("weights:", "  ".join(f"{w:+.4f}" for w in weights))

    correct = sum(1 for x, y in zip(X, target)
                  if (score_of(weights, x) >= 0.0) == (y == 1.0))
    print(f"{correct}/{len(X)} pieces classees correctement")

    piece = [10.20, 133.0]
    x = [1.0] + [(v - mean) / sd for v, (mean, sd) in zip(piece, stats)]
    z = score_of(weights, x)
    print(f"piece 10.20 mm / 133 HV : x = "
          f"[{x[1]:+.3f} ; {x[2]:+.3f}]   z = {z:+.3f}")
