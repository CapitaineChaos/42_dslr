import argparse
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'V.0_Common'))

from math import log
from dataset import Data, HOUSES
from stats import Stats
from errors import DataError, ModelError

E = 2.718281828459045
WEIGHTS = "weights.csv"


# Both branches keep the exponent negative or zero, so a score of -1000 underflows instead of overflowing
def sigmoid(x):
    if x >= 0:
        return 1 / (1 + pow(E, -x))
    exp_x = pow(E, x)
    return exp_x / (1 + exp_x)

def softplus(x):
    return max(0, x) + log(1 + pow(E, -abs(x)))


class LogisticRegression:
    COURSES = ["Astronomy", "Herbology", "Divination", "Muggle Studies", "Ancient Runes", "History of Magic", "Transfiguration", "Potions", "Charms", "Flying"]
    ALPHA = 1.0
    EPSILON = 1e-6
    MAX_ITER = 6000

    def __init__(self, dataset):
        self.weights = {}
        self.classes = HOUSES
        self.report = {}
        self.dataset = dataset

    def gd(self, X):
        if not X:
            raise ModelError("no student to train on")
        if not any(self.dataset.houses):
            raise ModelError(f"{self.dataset.file_path}: Hogwarts House column is empty, this file cannot train a model")
        for house in HOUSES:
            # Create the target vector for the current house
            targets = [1 if h == house else 0 for h in self.dataset.houses]
            if not any(targets):
                raise ModelError(f"{self.dataset.file_path}: no student in {house}")
            # X already carries the bias column, so weights[0] is the bias
            weights = [0.0] * len(X[0])
            prev_cost = float('inf')
            for iteration in range(1, self.MAX_ITER + 1):
                cost = 0.0
                slope = [0.0] * len(weights)
                for x, expected in zip(X, targets):
                    score = 0.0
                    for col in range(len(weights)):
                        score += weights[col] * x[col]
                    cost += softplus(score) - expected * score
                    delta = sigmoid(score) - expected
                    for col in range(len(weights)):
                        slope[col] += delta * x[col]
                cost /= len(targets)
                if cost != cost or cost == float('inf'):
                    raise ModelError(f"{house}: cost is not finite after {iteration} iterations, lower ALPHA")
                for col in range(len(weights)):
                    slope[col] /= len(targets)
                # Compare both costs before touching the weights, they must come from the same vector
                if abs(prev_cost - cost) / max(1, abs(cost)) < self.EPSILON:
                    break
                prev_cost = cost
                for col in range(len(weights)):
                    weights[col] -= self.ALPHA * slope[col]
            self.weights[house] = weights
            self.report[house] = (cost, iteration)

    # Everything logreg_predict needs: column order, preparation statistics, class order, weights
    def save_model(self, file_path, prepare):
        if not self.weights:
            raise ModelError("nothing to save, the model is not trained")
        lines = ["feature,median,mu,sigma"]
        for name in self.COURSES:
            lines.append(f"{name},{prepare.med[name]!r},{prepare.mu[name]!r},{prepare.sd[name]!r}")
        lines.append("class,bias," + ",".join(self.COURSES))
        for house in HOUSES:
            lines.append(house + "," + ",".join(repr(weight) for weight in self.weights[house]))
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write("\n".join(lines) + "\n")
        except OSError as err:
            raise DataError(f"{file_path}: {err.strerror or err}") from None



class Prepare:
    ASTRONOMY = "Astronomy"
    DEFENSE = "Defense Against the Dark Arts"

    def __init__(self, dataset, courses):
        self.courses = courses
        self.med = {}
        self.mu = {}
        self.sd = {}
        self.fit(dataset)

    # Astronomy is exactly -100 times Defense, so a missing value is recoverable
    def rebuild_astronomy(self, columns):
        astronomy = columns.get(self.ASTRONOMY)
        defense = columns.get(self.DEFENSE)
        if astronomy is None or defense is None:
            return
        for i, value in enumerate(astronomy):
            if value is None and defense[i] is not None:
                astronomy[i] = -100 * defense[i]

    # Work on a copy: the dataset keeps the file as it was read
    def take(self, dataset):
        absent = [name for name in self.courses if name not in dataset.courses]
        if absent:
            raise DataError(f"{dataset.file_path}: missing column: {', '.join(absent)}")
        columns = {name: list(values) for name, values in dataset.courses.items()}
        self.rebuild_astronomy(columns)
        return columns

    # Fit the model on the dataset, computing the median, mean and standard deviation of each column
    def fit(self, dataset):
        columns = self.take(dataset)
        for name in self.courses:
            present = Stats(columns[name])
            if present.count == 0:
                raise DataError(f"{dataset.file_path}: {name}: no value at all")
            self.med[name] = present.median
            filled = Stats([value if value is not None else self.med[name] for value in columns[name]])
            if filled.std == 0:
                raise DataError(f"{dataset.file_path}: {name}: constant column")
            self.mu[name] = filled.mean
            self.sd[name] = filled.std

    # Standardize the data, replacing missing values with the median of the column
    def transform(self, dataset):
        columns = self.take(dataset)
        rows = []
        for i in range(len(dataset.index)):
            row = [1.0]
            for name in self.courses:
                value = columns[name][i]
                if value is None:
                    value = self.med[name]
                row.append((value - self.mu[name]) / self.sd[name])
            rows.append(row)
        return rows

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a logistic regression model.")
    parser.add_argument("file_path", type=str, help="Path to the CSV file containing the training data.")
    args = parser.parse_args()

    # If no arguments are provided, print the help message
    if not args.file_path:
        parser.print_help()
        exit(1)

    # If too many arguments are provided, print the help message
    if len(vars(args)) > 1:
        print("Too many arguments provided.")
        parser.print_help()
        exit(1)

    try:
        data = Data(args.file_path)
    except DataError as err:
        print(err, file=sys.stderr)
        exit(1)

    print(f"{len(data.index)} students, {len(data.courses)} columns")
    for name in data.courses:
        print(f"  {name:<32} {data.missing[name]:>3} missing")

    try:
        prepare = Prepare(data, LogisticRegression.COURSES)
        X = prepare.transform(data)
    except DataError as err:
        print(err, file=sys.stderr)
        exit(1)

    print(f"X is {len(X)} x {len(X[0])}")

    try:
        model = LogisticRegression(data)
        model.gd(X)
        model.save_model(WEIGHTS, prepare)
    except ModelError as err:
        print(err, file=sys.stderr)
        exit(1)
    except DataError as err:
        print(err, file=sys.stderr)
        exit(1)

    for house in HOUSES:
        cost, iteration = model.report[house]
        print(f"  {house:<12} cost {cost:.4f}  {iteration:>5} iterations")
    print(f"model written to {WEIGHTS}")
