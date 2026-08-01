"""House sizes and holdout sizes quoted in the figures of part 2."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tuto'))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'V.0_Common'))
from dataset import HOUSES

from step4_total_cost import load
from step9_holdout import split

X, houses = load()
learn, test = split(houses)
print(f"{len(X)} students")
for house in HOUSES:
    total = houses.count(house)
    kept = sum(1 for i in learn if houses[i] == house)
    print(f"{house:<12} {total:>5} {total / len(X):>8.4f}   learn {kept:>4}   test {total - kept:>4}")
