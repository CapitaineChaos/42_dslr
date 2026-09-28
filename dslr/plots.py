import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.axes import Axes
from matplotlib.backend_bases import MouseEvent
from matplotlib.figure import Figure
from matplotlib.patches import Patch

from .data import HOUSE

COLORS = {
    "Gryffindor": "#C1121F",
    "Hufflepuff": "#E9C46A",
    "Ravenclaw": "#457B9D",
    "Slytherin": "#2D6A4F",
}
COLS = 5
BINS = 20


def legend(target: Figure | Axes, **placement) -> None:
    handles = [Patch(color=color, label=house) for house, color in COLORS.items()]
    target.legend(handles=handles, fontsize=8, **placement)


def hist(cell: Axes, df: pd.DataFrame, feature: str) -> None:
    # https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.hist.html

    # Mêmes intervalles pour les quatre maisons, sinon les barres ne se comparent pas
    column = df[feature].dropna()
    low, high = column.min(), column.max()
    if low == high:
        low, high = low - 0.5, high + 0.5
    edges = np.linspace(low, high, BINS + 1)

    for house, rows in df.groupby(HOUSE):
        cell.hist(rows[feature].dropna(), bins=edges, density=True,
                  color=COLORS[house], alpha=0.5, linewidth=0)


def scatter(cell: Axes, df: pd.DataFrame, x: str, y: str, size: float) -> None:
    # https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.scatter.html

    # matplotlib ignore les points où x ou y est NaN
    for house, rows in df.groupby(HOUSE):
        cell.scatter(rows[x], rows[y], s=size, alpha=0.5,
                     color=COLORS[house], linewidths=0)


def histograms(df: pd.DataFrame, features: list[str], eta: pd.Series) -> None:
    # https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.subplots.html

    rows = -(-len(features) // COLS)
    figure, cells = plt.subplots(rows, COLS, figsize=(20, rows * 3.5),
                                 layout="constrained", num="Histogram")
    cells = cells.flatten()

    for cell, feature in zip(cells, features):
        hist(cell, df, feature)
        cell.set_title(f"{feature}\nη² = {eta[feature]:.4f}", fontsize=8)
        cell.tick_params(labelsize=6, labelleft=False, left=False)

    for cell in cells[len(features):]:
        cell.set_visible(False)

    figure.supylabel("Density", fontsize=9)
    legend(figure, loc="outside lower center", ncol=len(COLORS))


def detail(df: pd.DataFrame, x: str, y: str) -> None:
    figure, cell = plt.subplots(figsize=(7, 6), num=x if x == y else f"{x} / {y}")

    if x == y:
        hist(cell, df, x)
        cell.set_ylabel("Density")
    else:
        scatter(cell, df, x, y, 8)
        cell.set_ylabel(y)

    cell.set_xlabel(x)
    # https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.legend.html
    legend(cell, loc="best")
    figure.tight_layout()
    figure.show()


# Pair plot : grille complète, histogramme sur la diagonale
# Scatter plot : triangle sous la diagonale, chaque paire une seule fois
def matrix(df: pd.DataFrame, features: list[str], title: str, lower_only: bool) -> None:
    # Sous la diagonale, la première ligne et la dernière colonne seraient vides
    ys = features[1:] if lower_only else features
    xs = features[:-1] if lower_only else features
    figure, cells = plt.subplots(len(ys), len(xs), figsize=(len(xs) * 2, len(ys) * 2),
                                 layout="constrained", squeeze=False, num=title)

    positions = {}
    for row, y in enumerate(ys):
        for col, x in enumerate(xs):
            cell = cells[row][col]
            if lower_only and features.index(x) >= features.index(y):
                cell.set_visible(False)
                continue
            positions[cell] = (x, y)

            if x == y:
                hist(cell, df, x)
            else:
                scatter(cell, df, x, y, 1)

            cell.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)
            if col == 0:
                cell.set_ylabel(y, fontsize=5, rotation=30, ha="right", labelpad=2)
            if row == len(ys) - 1:
                cell.set_xlabel(x, fontsize=5, rotation=30, ha="right", labelpad=2)

    # https://matplotlib.org/stable/users/explain/figure/event_handling.html
    def on_click(event: MouseEvent) -> None:
        if event.inaxes in positions:
            detail(df, *positions[event.inaxes])

    figure.canvas.mpl_connect("button_press_event", on_click)
    legend(figure, loc="outside upper center", ncol=len(COLORS))


def heatmap(matrix: pd.DataFrame, title: str, fmt: str, **scale) -> None:
    # https://matplotlib.org/stable/api/_as_gen/matplotlib.axes.Axes.imshow.html

    n = len(matrix)
    figure, cell = plt.subplots(figsize=(n * 0.7 + 3, n * 0.6 + 2), layout="constrained", num=title)
    image = cell.imshow(matrix.to_numpy(dtype=float), **scale)
    figure.colorbar(image, ax=cell)

    cell.set_xticks(range(n), matrix.columns, rotation=45, ha="right", fontsize=8)
    cell.set_yticks(range(n), matrix.index, fontsize=8)

    for row in range(n):
        for col in range(n):
            value = matrix.iloc[row, col]
            # Luma Rec. 709 sur les couleurs non linéarisées : assez juste pour choisir noir ou blanc
            red, green, blue, _ = image.cmap(image.norm(value))
            dark = 0.2126 * red + 0.7152 * green + 0.0722 * blue < 0.5
            cell.text(col, row, format(value, fmt), ha="center", va="center",
                      fontsize=7, color="white" if dark else "black")


def confusion_figure(matrix: pd.DataFrame) -> None:
    heatmap(matrix, "Confusion matrix", "d", cmap="Blues")
    plt.xlabel("Predicted")
    plt.ylabel("Truth")


# https://matplotlib.org/stable/api/backend_bases_api.html#matplotlib.backend_bases.FigureCanvasBase.new_timer
# La boucle Tk ne voit le Ctrl-C qu'au prochain événement de la fenêtre : un minuteur la réveille
# toutes les 200 ms, comme _keep_alive dans describe
def show() -> None:
    timer = plt.gcf().canvas.new_timer(interval=200)
    timer.add_callback(lambda: None)
    timer.start()
    plt.show()
