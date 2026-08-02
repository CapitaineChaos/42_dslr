from math import exp, log, log1p


def softplus(z):
    return max(z, 0.0) + log1p(exp(-abs(z)))


def student_cost(score, expected):
    return softplus(score) - expected * score


if __name__ == "__main__":
    print("no opinion, student inside the house  :", round(student_cost(0, 1), 6))
    print("no opinion, student outside           :", round(student_cost(0, 0), 6))
    print("confident and right                   :", round(student_cost(6, 1), 6))
    print("confident and wrong                   :", round(student_cost(6, 0), 6))
    print("z = -1000, expected 0                 :", round(student_cost(-1000, 0), 6))
    print("z = -1000, expected 1                 :", round(student_cost(-1000, 1), 6))
    print("log(2) =", round(log(2), 6))
