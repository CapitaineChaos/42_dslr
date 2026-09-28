import pandas as pd


class Stats:
    KEYS = ("Count", "Mean", "Std", "Min", "25%", "50%", "75%", "Max")

    def __init__(self, column: pd.Series):
        self.values = sorted(column.dropna())
        self.count = len(self.values)
        if not self.count:
            self.mean = self.std = self.min = self.max = self.median = float("nan")
            return

        self.sum = 0
        for x in self.values:
            self.sum += x
        self.mean = self.sum / self.count

        squares = 0
        for x in self.values:
            squares += (x - self.mean) ** 2
        self.std = (squares / self.count) ** 0.5

        self.min = self.values[0]
        self.max = self.values[-1]
        self.median = self.percentile(0.50)

    def percentile(self, q: float) -> float:
        if not self.count:
            return float("nan")
        pos = q * (self.count - 1)
        low = int(pos)
        high = min(low + 1, self.count - 1)
        frac = pos - low
        return self.values[low] + frac * (self.values[high] - self.values[low])

    def describe(self) -> list[float]:
        return [
            self.count,
            self.mean,
            self.std,
            self.min,
            self.percentile(0.25),
            self.median,
            self.percentile(0.75),
            self.max,
        ]


def describe(df: pd.DataFrame) -> pd.DataFrame:
    table = {name: Stats(df[name]).describe() for name in df.columns}
    return pd.DataFrame(table, index=Stats.KEYS)
