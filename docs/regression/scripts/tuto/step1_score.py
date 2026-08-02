from step0_prepare import load, fit_stats, design


def score_of(weights, x):
    total = 0.0
    for column in range(len(weights)):
        total += weights[column] * x[column]
    return total


if __name__ == "__main__":
    columns, houses = load()
    rows = list(range(len(houses)))
    X = design(columns, fit_stats(columns, rows), rows)
    print("student 3:", [round(v, 3) for v in X[3]])
    print("score with zero weights:", score_of([0.0, 0.0, 0.0], X[3]))
    print("score with M400        :",
          round(score_of([-4.7454, -3.4535, 3.4688], X[3]), 3))
