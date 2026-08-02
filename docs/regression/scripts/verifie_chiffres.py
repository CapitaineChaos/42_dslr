import os
import sys
from math import exp, log, log1p, sqrt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'V.0_Common'))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
from dataset import Data, HOUSES

COURSES = ["Herbology", "Ancient Runes"]
data = Data(os.path.join(ROOT, 'datasets', 'dataset_train.csv'))
raw = [data.courses[c] for c in COURSES]
houses = data.houses
m = len(houses)
rows = list(range(m))


def stats(marks, subset):
    known = sorted(marks[i] for i in subset if marks[i] is not None)
    half = len(known) // 2
    median = known[half] if len(known) % 2 else (known[half - 1] + known[half]) / 2
    filled = [marks[i] if marks[i] is not None else median for i in subset]
    mean = sum(filled) / len(filled)
    sd = (sum((v - mean) ** 2 for v in filled) / len(filled)) ** 0.5
    return median, mean, sd


ST = [stats(c, rows) for c in raw]
X = [[1.0] + [((c[i] if c[i] is not None else med) - mu) / sd
               for c, (med, mu, sd) in zip(raw, ST)] for i in rows]
Y = [1.0 if h == "Gryffindor" else 0.0 for h in houses]


def sigmoid(z):
    return 1 / (1 + exp(-z)) if z >= 0 else exp(z) / (1 + exp(z))


def softplus(z):
    return max(z, 0.0) + log1p(exp(-abs(z)))


def score(w, x):
    return sum(a * b for a, b in zip(w, x))


def cost(w, X, y):
    return sum(softplus(score(w, x)) - t * score(w, x) for x, t in zip(X, y)) / len(X)


def grad(w, X, y):
    g = [0.0] * len(w)
    for x, t in zip(X, y):
        e = sigmoid(score(w, x)) - t
        for j in range(len(w)):
            g[j] += e * x[j]
    return [v / len(X) for v in g]


def descend(X, y, alpha=1.0, turns=None, eps=1e-6, cap=6000):
    w = [0.0] * len(X[0])
    c = cost(w, X, y)
    trace = [(list(w), c)]
    for it in range(1, (turns or cap) + 1):
        g = grad(w, X, y)
        w = [a - alpha * b for a, b in zip(w, g)]
        prev, c = c, cost(w, X, y)
        trace.append((list(w), c))
        if turns is None and prev - c < eps * abs(prev):
            return w, c, it, trace
    return w, c, turns or cap, trace


out = []


def say(label, value):
    out.append(f"{label:<58} {value}")


say("effectif", m)
say("Gryffindor", sum(Y))
for name, (med, mu, sd) in zip(COURSES, ST):
    absent = sum(1 for v in raw[COURSES.index(name)] if v is None)
    say(f"{name}: absentes / mediane / moyenne / ecart-type",
        f"{absent} / {med:.4f} / {mu:.4f} / {sd:.4f}")

say("eleve 3 x1,x2", f"{X[3][1]:.4f} {X[3][2]:.4f}")

w400, c400, _, tr = descend(X, Y, turns=400)
say("M400 coefficients", " ".join(f"{v:+.4f}" for v in w400))
say("M400 cout", f"{c400:.6f}")
say("M400 norme (w1,w2)", f"{sqrt(w400[1]**2 + w400[2]**2):.4f}")
say("M400 norme (w0,w1,w2)", f"{sqrt(sum(v*v for v in w400)):.4f}")
say("cout iteration 0 / 10 / 50 / 400",
    " / ".join(f"{tr[k][1]:.6f}" for k in (0, 10, 50, 400)))
say("part de la baisse faite en 10 tours",
    f"{(tr[0][1]-tr[10][1])/(tr[0][1]-tr[400][1])*100:.1f} %")
say("baisse des 350 derniers tours", f"{tr[50][1]-tr[400][1]:.6f}")

z400 = [score(w400, x) for x in X]
say("M400 eleve 3 score / p", f"{z400[3]:+.4f} / {sigmoid(z400[3]):.4f}")
wrong = [i for i in rows if (z400[i] >= 0) != (Y[i] == 1.0)]
say("M400 mal classes (binaire)", len(wrong))
costs = sorted(((softplus(z400[i]) - Y[i]*z400[i]), i) for i in rows)
tot = sum(c for c, _ in costs)
top = costs[-int(0.02*m):]
say("part du cout portee par les 2 % les plus eleves",
    f"{sum(c for c, _ in top)/tot*100:.1f} %")
say("perte maximale sur une prediction", f"{costs[-1][0]:.2f}")

wstop, cstop, itstop, _ = descend(X, Y)
say("Marr coefficients", " ".join(f"{v:+.4f}" for v in wstop))
say("Marr cout / iterations", f"{cstop:.6f} / {itstop}")

for a in (0.05, 0.3, 1.0, 100.0):
    w = [0.0]*3
    c0 = cost(w, X, Y)
    seq = [c0]
    for _ in range(40):
        g = grad(w, X, Y)
        w = [p - a*q for p, q in zip(w, g)]
        seq.append(cost(w, X, Y))
    say(f"alpha={a}: depart / 1 tour / 40 tours",
        f"{seq[0]:.6f} / {seq[1]:.6f} / {seq[40]:.6f}")

w = [0.0]*3
for _ in range(1):
    g = grad(w, X, Y)
    w = [p - 1000.0*q for p, q in zip(w, g)]
say("alpha=1000 : cout apres un tour", f"{cost(w, X, Y):.4f}")

best = None
for k in range(0, 100001):
    s = k / 100000
    if not 0 < s < 1:
        continue
    t = log(s/(1-s))
    err = sum(1 for i in rows if (z400[i] >= t) != (Y[i] == 1.0))
    if best is None or err < best[0]:
        best = (err, s)
say("meilleur seuil sur M400 (grille 1e-5) : erreurs / seuil",
    f"{best[0]} / {best[1]:.5f}")
for s in (0.30, 0.50, 0.58, 0.70):
    t = log(s/(1-s))
    miss = sum(1 for i in rows if Y[i] == 1.0 and z400[i] < t)
    false = sum(1 for i in rows if Y[i] == 0.0 and z400[i] >= t)
    say(f"seuil {s}: manques / a tort / total", f"{miss} / {false} / {miss+false}")

q = sum(1 for i in rows if X[i][1] < 0 and X[i][2] > 0)
qg = sum(1 for i in rows if X[i][1] < 0 and X[i][2] > 0 and Y[i] == 1.0)
say("quadrant x1<0, x2>0 : total / Gryffindor / autres", f"{q} / {qg} / {q-qg}")
say("Gryffindor hors de ce quadrant", int(sum(Y)) - qg)

model = {}
for house in HOUSES:
    t = [1.0 if h == house else 0.0 for h in houses]
    model[house], c, it, _ = descend(X, t)
    say(f"M4 {house}", " ".join(f"{v:+.4f}" for v in model[house])
        + f"   cout {c:.4f}  {it} tours")

right = sum(1 for i in rows
            if max(HOUSES, key=lambda h: score(model[h], X[i])) == houses[i])
say("M4 exactitude sur les donnees d'entrainement", f"{right}/{m} = {right/m:.4f}")

for i in (3, 571):
    sc = {h: score(model[h], X[i]) for h in HOUSES}
    say(f"eleve {i} scores ({houses[i]})",
        "  ".join(f"{h[:4]} {sc[h]:+.3f}" for h in HOUSES))

sums = [sum(sigmoid(score(model[h], X[i])) for h in HOUSES) for i in rows]
say("somme des quatre probabilites > 1", sum(1 for s in sums if s > 1))
say("somme <= 1", sum(1 for s in sums if s <= 1))
for i in (1025, 326, 1067):
    say(f"eleve {i} : somme des quatre probabilites", f"{sums[i]:.3f}")

print("\n".join(out))
