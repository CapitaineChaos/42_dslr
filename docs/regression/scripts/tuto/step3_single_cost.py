from math import log
from step2_sigmoid import sigmoid


def student_cost(score, expected):
    # expected: 1.0 if the student is in the house, 0.0 otherwise
    p = sigmoid(score)
    return -(expected * log(p) + (1 - expected) * log(1 - p))


if __name__ == "__main__":
    print("no opinion, student inside the house  :", round(student_cost(0, 1), 6))
    print("no opinion, student outside           :", round(student_cost(0, 0), 6))
    print("confident and right                   :", round(student_cost(6, 1), 6))
    print("confident and wrong                   :", round(student_cost(6, 0), 6))
    print("log(2) =", round(log(2), 6))
