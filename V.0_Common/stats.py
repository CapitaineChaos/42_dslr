#!/usr/bin/env python3
"""Descriptive statistics of one column. None values are left out, so a column holding only None describes as None."""

from functools import reduce


class Stats:
    KEYS = ("count", "std", "mean", "min", "25%", "50%", "75%", "max")

    def __init__(self, array):
        self.values = sorted(x for x in array if x is not None)
        self.count = len(self.values)
        self.sum = 0
        for x in self.values:
            self.sum += x
        self.mean = self.sum / self.count if self.count else None
        self.std = (reduce(lambda acc, val: acc + (val - self.mean) ** 2, self.values, 0) / self.count) ** 0.5 if self.count else None
        self.min = self.values[0] if self.count else None
        self.max = self.values[-1] if self.count else None
        self.p25 = self.percentile(0.25)
        self.median = self.percentile(0.50)
        self.p75 = self.percentile(0.75)

    def percentile(self, q):
        if not 0 <= q <= 1:
            raise ValueError(f"percentile out of range: {q}")
        if not self.count:
            return None
        pos = q * (self.count - 1)
        low = int(pos)
        high = min(low + 1, self.count - 1)
        frac = pos - low
        return self.values[low] + frac * (self.values[high] - self.values[low])

    def describe(self):
        return {
            "count": self.count,
            "std":   self.std,
            "mean":  self.mean,
            "min":   self.min,
            "25%":   self.p25,
            "50%":   self.median,
            "75%":   self.p75,
            "max":   self.max,
        }
