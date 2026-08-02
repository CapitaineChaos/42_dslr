from step4_total_cost import load, fit_stats, design, total_cost
from step6_one_step import one_step

EPSILON, MAX_ITER = 1e-6, 6000


def descend(X, target):
    weights = [0.0] * len(X[0])
    cost = total_cost(weights, X, target)
    for iteration in range(1, MAX_ITER + 1):
        weights = one_step(weights, X, target)
        previous, cost = cost, total_cost(weights, X, target)
        if previous - cost < EPSILON * abs(previous):
            return weights, cost, iteration
    return weights, cost, MAX_ITER


if __name__ == "__main__":
    columns, houses = load()
    rows = list(range(len(houses)))
    X = design(columns, fit_stats(columns, rows), rows)
    target = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
    weights, cost, iterations = descend(X, target)
    print(f"stopped after {iterations} iterations, cost {cost:.6f}")
    print("weights:", "  ".join(f"{w:+.4f}" for w in weights))
