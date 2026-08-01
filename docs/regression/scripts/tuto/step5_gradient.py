from step2_sigmoid import sigmoid
from step4_total_cost import load, score_of, total_cost


def gradient(weights, X, target):
    slope = [0.0] * len(weights)
    for x, expected in zip(X, target):
        error = sigmoid(score_of(weights, x)) - expected
        for column in range(len(weights)):
            slope[column] += error * x[column]
    return [s / len(X) for s in slope]


def measured_slope(weights, X, target, column, h=1e-5):
    below, above = list(weights), list(weights)
    below[column] -= h
    above[column] += h
    rise = total_cost(above, X, target) - total_cost(below, X, target)
    return rise / (2 * h)


if __name__ == "__main__":
    X, houses = load()
    target = [1.0 if house == "Gryffindor" else 0.0 for house in houses]
    weights = [0.3, -0.7, 0.4]          # any point away from zero
    computed = gradient(weights, X, target)
    print("column    from the formula        measured             gap")
    for column in range(3):
        measured = measured_slope(weights, X, target, column)
        print(f"   {column}         {computed[column]:+.9f}     {measured:+.9f}     {abs(computed[column] - measured):.2e}")
