import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'V.0_Common'))
from dataset import Data

from step3_single_cost import student_cost

TRAIN = os.path.join(ROOT, 'datasets', 'dataset_train.csv')
COURSES = ["Herbology", "Ancient Runes"]


def standardise(marks):
    known = sorted(v for v in marks if v is not None)
    median = known[len(known) // 2]
    filled = [v if v is not None else median for v in marks]
    mean = sum(filled) / len(filled)
    sd = (sum((v - mean) ** 2 for v in filled) / len(filled)) ** 0.5
    return [(v - mean) / sd for v in filled]


def load():
    data = Data(TRAIN)
    columns = [standardise(data.courses[course]) for course in COURSES]
    X = []
    for row in range(len(data.houses)):
        X.append([1.0] + [column[row] for column in columns])
    return X, data.houses


def score_of(weights, x):
    total = 0.0
    for column in range(len(weights)):
        total += weights[column] * x[column]
    return total


def total_cost(weights, X, target):
    total = 0.0
    for x, expected in zip(X, target):
        total += student_cost(score_of(weights, x), expected)
    return total / len(X)


if __name__ == "__main__":
    X, houses = load()
    target = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
    print(f"{len(X)} students, {len(X[0])} columns (bias included)")
    print("cost with zero weights:", round(total_cost([0.0] * 3, X, target), 6))
