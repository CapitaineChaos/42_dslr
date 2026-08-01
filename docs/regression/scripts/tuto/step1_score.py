x = [1.0, -1.485, 0.275]     # student 3; the 1.0 carries the bias
weights = [0.0, 0.0, 0.0]

score = weights[0] * x[0] + weights[1] * x[1] + weights[2] * x[2]
print("score:", score)
