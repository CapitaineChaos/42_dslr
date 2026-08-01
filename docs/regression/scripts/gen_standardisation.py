"""Raw marks for the standardisation chapter, plus the statistics it quotes."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'V.0_Common'))
from dataset import Data

OUT = os.path.join(HERE, '..', 'data')
COURSES = ["Herbology", "Ancient Runes"]
data = Data(os.path.join(ROOT, 'datasets', 'dataset_train.csv'))

filled = {}
for course in COURSES:
    marks = data.courses[course]
    known = sorted(v for v in marks if v is not None)
    median = known[len(known) // 2]
    column = [v if v is not None else median for v in marks]
    mean = sum(column) / len(column)
    sd = (sum((v - mean) ** 2 for v in column) / len(column)) ** 0.5
    filled[course] = column
    print(f"{course}: {len(marks) - len(known)} missing, min {known[0]:.2f}, max {known[-1]:.2f}, median {median:.3f}, mean {mean:.3f}, sd {sd:.3f}")

# Un point sur trois, comme les nuages standardises de gen_data.py.
with open(f'{OUT}/brut_gryffindor.dat', 'w') as fg, open(f'{OUT}/brut_autres.dat', 'w') as fa:
    fg.write("x y\n")
    fa.write("x y\n")
    for row, house in enumerate(data.houses):
        if row % 3:
            continue
        line = f"{filled['Herbology'][row]:.3f} {filled['Ancient Runes'][row]:.3f}\n"
        (fg if house == "Gryffindor" else fa).write(line)

for row in (3, 21):
    raw = [data.courses[c][row] for c in COURSES]
    print(f"row {row}: raw {raw}, filled {[round(filled[c][row], 3) for c in COURSES]}")
