import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES

from step4_total_cost import load
from step8_four_houses import train, predict


def split(houses, part=0.8, seed=0):
    state, learn, test = seed, [], []
    # drawn house by house, so both sides keep the same proportions
    for house in HOUSES:
        rows = [i for i, h in enumerate(houses) if h == house]
        for k in range(len(rows) - 1, 0, -1):
            state = (state * 1103515245 + 12345) % (1 << 31)
            j = state % (k + 1)
            rows[k], rows[j] = rows[j], rows[k]
        cut = round(part * len(rows))
        learn += rows[:cut]
        test += rows[cut:]
    return learn, test


def accuracy(model, X, houses, rows):
    right = sum(1 for i in rows if predict(model, X[i]) == houses[i])
    return right / len(rows)


if __name__ == "__main__":
    X, houses = load()
    learn, test = split(houses)
    print(f"{len(learn)} students to learn from, {len(test)} set aside\n")
    model = train([X[i] for i in learn], [houses[i] for i in learn])
    print(f"\non students already seen : {accuracy(model, X, houses, learn):.4f}")
    print(f"on students never seen   : {accuracy(model, X, houses, test):.4f}")
    kept = [houses[i] for i in test]
    biggest = max(HOUSES, key=kept.count)
    print(f"everyone into {biggest} : {kept.count(biggest) / len(test):.4f}")
