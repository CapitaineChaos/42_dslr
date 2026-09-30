"""Calculs du constructeur de scénario : standardisation, descente de gradient
au même critère d'arrêt que logreg_train, et mesure des propriétés visées."""

from __future__ import annotations

import math

# Bornes de conformité : une nappe nettement inclinée, sans être verticale.
NORM_RANGE = (2.5, 9.0)
LAST_FLIP_RANGE = (20, 300)
MAX_ITERATIONS = 700
MIN_LATE = 2
MIN_LEVELS = 4


def sigmoid(x: float) -> float:
    if x >= 0:
        return 1 / (1 + math.exp(-x))
    ex = math.exp(x)
    return ex / (1 + ex)


def softplus(x: float) -> float:
    return max(0.0, x) + math.log(1 + math.exp(-abs(x)))


def standardize(rows, positive: str):
    pot = [r[0] for r in rows]
    vol = [r[1] for r in rows]
    def stat(col):
        mu = sum(col) / len(col)
        sd = (sum((v - mu) ** 2 for v in col) / len(col)) ** 0.5
        return mu, sd
    mu_p, sd_p = stat(pot)
    mu_v, sd_v = stat(vol)
    design = [[1.0, (r[0] - mu_p) / sd_p, (r[1] - mu_v) / sd_v] for r in rows]
    targets = [1 if r[2] == positive else 0 for r in rows]
    return design, targets, (mu_p, sd_p, mu_v, sd_v)


def descend(design, targets, alpha, max_iter=6000, epsilon=1e-3):
    weights = [0.0, 0.0, 0.0]
    trace = []
    for iteration in range(max_iter + 1):
        cost = 0.0
        slope = [0.0, 0.0, 0.0]
        for row, y in zip(design, targets):
            z = sum(w * x for w, x in zip(weights, row))
            cost += softplus(z) - y * z
            delta = sigmoid(z) - y
            for col in range(3):
                slope[col] += delta * row[col]
        cost /= len(targets)
        for col in range(3):
            slope[col] /= len(targets)
        trace.append((cost, list(weights)))
        if math.hypot(*slope) < epsilon or iteration == max_iter:
            break
        for col in range(3):
            weights[col] -= alpha * slope[col]
    return trace


def predictions(design, weights):
    return [1 if sum(w * x for w, x in zip(weights, row)) > 0 else 0 for row in design]


def measure(design, targets, trace):
    """Mesure les propriétés visées. conforms() les compare aux bornes."""
    n = len(targets)
    flips = {}
    previous = predictions(design, trace[0][1])
    for t in range(1, len(trace)):
        current = predictions(design, trace[t][1])
        for i in range(n):
            if current[i] != previous[i]:
                flips.setdefault(i, []).append(t)
        previous = current

    def accuracy(t):
        pred = predictions(design, trace[t][1])
        return sum(1 for p, y in zip(pred, targets) if p == y) / n

    marks = [t for t in (0, 1, 2, 5, 10, 25, 50, 100, 200, len(trace) - 1)
             if t < len(trace)]
    return {
        "iterations": len(trace),
        "norm": math.hypot(*trace[-1][1][1:]),
        "last_flip": max((max(v) for v in flips.values()), default=0),
        "late": sum(1 for v in flips.values() if max(v) > 10),
        "levels": len({round(accuracy(t), 3) for t in marks}),
        "marks": [(t, trace[t][0], accuracy(t)) for t in marks],
        "accuracy_final": accuracy(len(trace) - 1),
    }


def conforms(m) -> list[str]:
    """Renvoie la liste des bornes violées, vide si tout tient."""
    faults = []
    if not NORM_RANGE[0] <= m["norm"] <= NORM_RANGE[1]:
        faults.append(f"‖w‖ {m['norm']:.2f} hors [{NORM_RANGE[0]}, {NORM_RANGE[1]}]")
    if not LAST_FLIP_RANGE[0] <= m["last_flip"] <= LAST_FLIP_RANGE[1]:
        faults.append(f"dernier basculement {m['last_flip']} hors "
                      f"[{LAST_FLIP_RANGE[0]}, {LAST_FLIP_RANGE[1]}]")
    if m["iterations"] > MAX_ITERATIONS:
        faults.append(f"{m['iterations']} itérations, plafond {MAX_ITERATIONS}")
    if m["late"] < MIN_LATE:
        faults.append(f"{m['late']} basculement(s) tardif(s), minimum {MIN_LATE}")
    if m["levels"] < MIN_LEVELS:
        faults.append(f"{m['levels']} paliers d'exactitude, minimum {MIN_LEVELS}")
    return faults


def show(label, m, faults):
    print(f"{label}")
    print(f"  {m['iterations']} itérations, ‖w‖ {m['norm']:.2f}, "
          f"dernier basculement t={m['last_flip']}, {m['late']} tardifs, "
          f"{m['levels']} paliers")
    if faults:
        for fault in faults:
            print(f"    rejeté : {fault}")
    else:
        print("  t      J        exactitude")
        for t, cost, acc in m["marks"]:
            print(f"  {t:<6} {cost:.4f}   {acc * 100:5.1f} %")
