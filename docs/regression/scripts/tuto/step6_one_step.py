from step4_total_cost import load, total_cost
from step5_gradient import gradient

ALPHA = 1.0


def one_step(weights, X, target):
    slope = gradient(weights, X, target)
    return [w - ALPHA * g for w, g in zip(weights, slope)]


if __name__ == "__main__":
    X, houses = load()
    target = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
    weights = [0.0, 0.0, 0.0]
    for turn in range(4):
        print(f"turn {turn}   cost {total_cost(weights, X, target):.6f}   weights " + "  ".join(f"{w:+.4f}" for w in weights))
        weights = one_step(weights, X, target)
