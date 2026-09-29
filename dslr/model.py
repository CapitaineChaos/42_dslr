from pathlib import Path

import numpy as np
import pandas as pd

from .data import HOUSES, load
from .stats import Stats

COURSES = [
    "Astronomy",
    "Herbology",
    "Divination",
    "Muggle Studies",
    "Ancient Runes",
    "History of Magic",
    "Transfiguration",
    "Potions",
    "Charms",
    "Flying",
]
ASTRONOMY = "Astronomy"
DEFENSE = "Defense Against the Dark Arts"
REQUIRED = COURSES + [DEFENSE]

ALPHA = 1.0
EPSILON = 1e-3
MAX_ITER = 6000


# Les deux branches gardent un exposant négatif ou nul : z = -1000 donne 0 au lieu d'un dépassement
def sigmoid(z: np.ndarray) -> np.ndarray:
    e = np.exp(-np.abs(z))
    return np.where(z >= 0, 1 / (1 + e), e / (1 + e))


def softplus(z: np.ndarray) -> np.ndarray:
    return np.maximum(0, z) + np.log(1 + np.exp(-np.abs(z)))


# Astronomy vaut exactement -100 × Defense : une note manquante se déduit de l'autre
def rebuild_astronomy(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df[ASTRONOMY] = df[ASTRONOMY].fillna(-100 * df[DEFENSE])
    return df


def fit_scaler(df: pd.DataFrame) -> pd.DataFrame:
    df = rebuild_astronomy(df)
    scaler = pd.DataFrame(index=COURSES, columns=["median", "mu", "sigma"], dtype=float)

    for name in COURSES:
        present = Stats(df[name])
        if present.count == 0:
            raise ValueError(f"{name}: no value at all")
        filled = Stats(df[name].fillna(present.median))
        if filled.std == 0:
            raise ValueError(f"{name}: constant column")
        scaler.loc[name] = [present.median, filled.mean, filled.std]

    return scaler


# Valeur manquante -> médiane, puis z = (x - mu) / sigma ; la colonne 0 vaut 1 et porte le biais
def transform(df: pd.DataFrame, scaler: pd.DataFrame) -> np.ndarray:
    x = rebuild_astronomy(df)[COURSES].fillna(scaler["median"])
    z = (x - scaler["mu"]) / scaler["sigma"]
    return np.column_stack([np.ones(len(z)), z.to_numpy()])


# https://web.stanford.edu/class/archive/cs/cs109/cs109.1264/lectures/20-LogisticRegression/20-LogisticRegression.pdf
def gradient_descent(x: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, float, float, int]:
    m = len(y)
    theta = np.zeros(x.shape[1])

    for iteration in range(MAX_ITER + 1):
        # z = θᵀx
        z = x @ theta

        # ∂J/∂θⱼ = 1/m Σ (h(xⁱ) - yⁱ)·xⱼⁱ
        gradient = x.T @ (sigmoid(z) - y) / m
        norm = np.linalg.norm(gradient)
        if norm < EPSILON or iteration == MAX_ITER:
            break

        theta -= ALPHA * gradient

    # J(θ) = -1/m Σ y·log(h) + (1-y)·log(1-h), écrit log(1 + eᶻ) - y·z pour rester fini
    cost = np.sum(softplus(z) - y * z) / m
    return theta, cost, norm, iteration


def train(x: np.ndarray, houses: pd.Series) -> tuple[pd.DataFrame, dict]:
    weights = pd.DataFrame(index=["bias"] + COURSES, columns=HOUSES, dtype=float)
    report = {}

    # One-vs-all : un modèle par maison, 1 pour ses élèves, 0 pour les autres
    for house in HOUSES:
        y = (houses == house).to_numpy(dtype=float)
        if not y.any():
            raise ValueError(f"no student in {house}")
        theta, cost, norm, iteration = gradient_descent(x, y)
        weights[house] = theta
        report[house] = (cost, norm, iteration)

    return weights, report


# σ est croissante : la maison au plus haut θᵀx est aussi celle à la plus haute probabilité
def predict(x: np.ndarray, weights: pd.DataFrame) -> np.ndarray:
    scores = x @ weights[HOUSES].to_numpy()
    return np.array(HOUSES)[scores.argmax(axis=1)]


def save(path: str, scaler: pd.DataFrame, weights: pd.DataFrame) -> None:
    out = Path(path)
    if out.is_symlink():
        raise OSError(f"{out.name}: symlink forbidden")

    # Une ligne par colonne de X : médiane, mu, sigma pour la préparer, puis un poids par maison
    model = pd.concat([scaler.reindex(weights.index), weights], axis=1)
    model.to_csv(out, index_label="feature")


def read_model(path: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    scaling = ["median", "mu", "sigma"]
    model = load(path, ["feature"] + scaling + HOUSES)
    name = model.attrs["name"]
    model = model.set_index("feature")

    for row in ["bias"] + COURSES:
        if row not in model.index:
            raise ValueError(f"{name}: missing row {row}")

    # https://pandas.pydata.org/docs/reference/api/pandas.api.types.is_numeric_dtype.html
    for column in scaling + HOUSES:
        if not pd.api.types.is_numeric_dtype(model[column]):
            raise ValueError(f"{name}: {column}: not a number")

    scaler = model.loc[COURSES, scaling]
    weights = model.loc[["bias"] + COURSES, HOUSES]
    if scaler.isna().any().any() or weights.isna().any().any():
        raise ValueError(f"{name}: empty value")
    if (scaler["sigma"] == 0).any():
        raise ValueError(f"{name}: sigma is zero")

    return scaler, weights
