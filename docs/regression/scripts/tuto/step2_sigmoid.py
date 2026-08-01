from math import exp


def sigmoid(z):
    if z >= 0:
        return 1 / (1 + exp(-z))
    return exp(z) / (1 + exp(z))     # exponent stays negative


if __name__ == "__main__":
    print("sigmoid(0)    =", sigmoid(0))
    print("sigmoid(2)    =", round(sigmoid(2), 4))
    print("sigmoid(-800) =", sigmoid(-800))
    try:
        print(1 / (1 + exp(800)))       # single-branch version, same number
    except OverflowError as err:
        print("single branch : OverflowError,", err)
