"""House sizes and holdout sizes quoted in the figures of part 2."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES

from step4_total_cost import load, fit_stats, design
from step9_holdout import split

columns, houses = load()
all_rows = list(range(len(houses)))
X = design(columns, fit_stats(columns, all_rows), all_rows)
learn, test = split(houses)
print(f"{len(X)} students")
for house in HOUSES:
    total = houses.count(house)
    kept = sum(1 for i in learn if houses[i] == house)
    print(f"{house:<12} {total:>5} {total / len(X):>8.4f}   learn {kept:>4}   test {total - kept:>4}")
