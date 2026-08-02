from step0_prepare import COURSES, TRAIN, load, fit_stats, design
from step1_score import score_of
from step3_single_cost import student_cost


def total_cost(weights, X, target):
    total = 0.0
    for x, expected in zip(X, target):
        total += student_cost(score_of(weights, x), expected)
    return total / len(X)


if __name__ == "__main__":
    columns, houses = load()
    rows = list(range(len(houses)))
    X = design(columns, fit_stats(columns, rows), rows)
    target = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
    cost = total_cost([0.0] * 3, X, target)
    print(f"{len(X)} students, {len(X[0])} columns (bias included)")
    print("cost with zero weights:", round(cost, 6))
