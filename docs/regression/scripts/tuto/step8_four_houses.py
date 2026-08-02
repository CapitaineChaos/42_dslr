import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES

from step4_total_cost import load, fit_stats, design, score_of
from step7_loop import descend


def train(X, houses):
    model = {}
    for house in HOUSES:
        target = [1.0 if h == house else 0.0 for h in houses]
        model[house], cost, iterations = descend(X, target)
        print(f"  {house:<12} cost {cost:.4f}   {iterations:>4} iterations")
    return model


def predict(model, x):
    return max(HOUSES, key=lambda house: score_of(model[house], x))


if __name__ == "__main__":
    columns, houses = load()
    rows = list(range(len(houses)))
    X = design(columns, fit_stats(columns, rows), rows)
    model = train(X, houses)
    right = sum(1 for x, house in zip(X, houses) if predict(model, x) == house)
    print(f"\n{right} students out of {len(X)} get their house, that is {right / len(X):.4f}")
    print("measured on the very students used to fit: optimistic by construction")
