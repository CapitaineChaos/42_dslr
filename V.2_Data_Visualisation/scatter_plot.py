#!/usr/bin/env python3

### Tout revoir de 0 car le fichier a été réalisé par COPILOTE !!!!!!!!

"""
scatter_plot.py — Which two Hogwarts features are the most similar?

Displays the full lower-triangle scatter plot matrix (78 pairs).
Each point is one student, coloured by house.
The most visually aligned pair is the answer.
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from describe_modified import get_rows

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
except ImportError:
    print("matplotlib is required: pip install matplotlib")
    sys.exit(1)

HOUSE_COLORS = {
    "Gryffindor": "#C1121F",
    "Hufflepuff": "#E9C46A",
    "Ravenclaw":  "#457B9D",
    "Slytherin":  "#2D6A4F",
}


def open_detail(feat_x, feat_y, rows, houses):
    """Open a single scatter plot in its own zoomable window."""
    fig2, ax2 = plt.subplots(figsize=(7, 6))
    fig2.suptitle(f"{feat_x}  vs  {feat_y}", fontsize=12)
    for house, color in HOUSE_COLORS.items():
        xs, ys = [], []
        for i, h in enumerate(houses):
            if h != house:
                continue
            x = rows[feat_x][i]
            y = rows[feat_y][i]
            if x is not None and y is not None:
                xs.append(x)
                ys.append(y)
        if xs:
            ax2.scatter(xs, ys, s=8, alpha=0.5, color=color, label=house, linewidths=0)
    ax2.set_xlabel(feat_x)
    ax2.set_ylabel(feat_y)
    ax2.legend(fontsize=8)
    fig2.tight_layout()
    fig2.show()


def plot_scatter_matrix(features, rows, houses):
    n = len(features)
    fig, axes = plt.subplots(n, n, figsize=(n * 2, n * 2))
    fig.suptitle("Scatter plot matrix", fontsize=11, y=1.01)

    # pre-build point data so the click handler can reuse it
    pair_points = {}
    for row in range(n):
        for col in range(n):
            ax = axes[row][col]

            if col >= row:
                ax.set_visible(False)
                continue

            feat_x = features[col]
            feat_y = features[row]

            points = {house: ([], []) for house in HOUSE_COLORS}
            for i, house in enumerate(houses):
                x = rows[feat_x][i]
                y = rows[feat_y][i]
                if x is not None and y is not None and house in points:
                    points[house][0].append(x)
                    points[house][1].append(y)

            pair_points[(row, col)] = (feat_x, feat_y)

            for house, (xs, ys) in points.items():
                if xs:
                    ax.scatter(xs, ys, s=1, alpha=0.3,
                               color=HOUSE_COLORS[house], linewidths=0)

            ax.tick_params(left=False, bottom=False,
                           labelleft=False, labelbottom=False)

            if col == 0:
                ax.set_ylabel(feat_y, fontsize=5, rotation=30,
                              ha='right', labelpad=2)
            if row == n - 1:
                ax.set_xlabel(feat_x, fontsize=5, rotation=30,
                              ha='right', labelpad=2)

    def on_click(event):
        if event.inaxes is None:
            return
        for (r, c), ax in zip(
            [(r, c) for r in range(n) for c in range(n) if c < r],
            [axes[r][c] for r in range(n) for c in range(n) if c < r]
        ):
            if event.inaxes is ax:
                fx, fy = pair_points[(r, c)]
                open_detail(fx, fy, rows, houses)
                break

    fig.canvas.mpl_connect('button_press_event', on_click)

    legend_handles = [
        mpatches.Patch(color=color, label=house)
        for house, color in HOUSE_COLORS.items()
    ]
    fig.legend(handles=legend_handles, loc="upper right",
               fontsize=8, bbox_to_anchor=(1.0, 1.0))

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scatter matrix: find the two most similar features."
    )
    parser.add_argument("file_path", help="Path to dataset CSV")
    args = parser.parse_args()

    features, rows, houses = get_rows(args.file_path)
    plot_scatter_matrix(features, rows, houses)
