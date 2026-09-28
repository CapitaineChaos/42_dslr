import numpy as np
import pandas as pd

from .data import HOUSE

SEED = 2026


def eta_squared(df: pd.DataFrame, features: list[str]) -> pd.Series:
    # https://en.wikipedia.org/w/index.php?title=Effect_size&oldid=1377099193#Eta-squared_(%CE%B72)
    # η² = σ²inter / σ²totale : part de la variance d'une matière expliquée par la maison

    scores = {}
    for feature in features:
        rows = df[[feature, HOUSE]].dropna()
        x = rows[feature].to_numpy()
        total = ((x - x.mean()) ** 2).sum()
        if total == 0:
            raise ValueError(f"{feature}: constant column")

        between = 0.0
        for _, group in rows.groupby(HOUSE):
            g = group[feature].to_numpy()
            between += len(g) * (g.mean() - x.mean()) ** 2

        scores[feature] = between / total
    return pd.Series(scores).sort_values()


def pearson(df: pd.DataFrame, features: list[str]) -> pd.DataFrame:
    # https://en.wikipedia.org/w/index.php?title=Pearson_correlation_coefficient&oldid=1375949723#For_a_sample
    # r = Σ(x - x̄)(y - ȳ) / √(Σ(x - x̄)² · Σ(y - ȳ)²)

    matrix = pd.DataFrame(index=features, columns=features, dtype=float)
    for a in features:
        for b in features:
            # Un élève sans note dans l'une des deux matières est écarté de la paire
            both = df[a].notna() & df[b].notna()
            x = df.loc[both, a].to_numpy()
            y = df.loc[both, b].to_numpy()
            x = x - x.mean()
            y = y - y.mean()
            matrix.loc[a, b] = (x @ y) / np.sqrt((x @ x) * (y @ y))
    return matrix


def folds(df: pd.DataFrame, k: int) -> list[pd.DataFrame]:
    # https://numpy.org/doc/stable/reference/random/generated/numpy.random.Generator.permutation.html
    # Stratifié : chaque maison est répartie à parts égales entre les k parts

    rng = np.random.default_rng(SEED)
    parts = [[] for _ in range(k)]
    for _, group in df.groupby(HOUSE):
        shuffled = group.iloc[rng.permutation(len(group))]
        for i in range(k):
            parts[i].append(shuffled.iloc[i::k])

    return [pd.concat(part).sort_index() for part in parts]


def confusion(truth: pd.Series, preds: pd.Series, labels: list[str]) -> pd.DataFrame:
    # Ligne = maison réelle, colonne = maison prédite
    matrix = pd.DataFrame(0, index=labels, columns=labels)
    for real, pred in zip(truth, preds):
        matrix.loc[real, pred] += 1
    return matrix


def scores(matrix: pd.DataFrame) -> pd.DataFrame:
    # https://en.wikipedia.org/w/index.php?title=Precision_and_recall&oldid=1366666540#Definition

    report = {}
    for label in matrix.index:
        good = matrix.loc[label, label]
        real = matrix.loc[label].sum()
        predicted = matrix[label].sum()

        # Justesse des prédictions de cette maison, couverture de ses vrais élèves
        precision = good / predicted if predicted else 0.0
        recall = good / real if real else 0.0

        # Moyenne harmonique des deux
        both = precision + recall
        f1 = 2 * precision * recall / both if both else 0.0

        report[label] = {"precision": precision, "recall": recall, "f1-score": f1, "total": real}
    return pd.DataFrame.from_dict(report, orient="index")


def accuracy(matrix: pd.DataFrame) -> float:
    good = 0
    for label in matrix.index:
        good += matrix.loc[label, label]
    return good / matrix.to_numpy().sum()
