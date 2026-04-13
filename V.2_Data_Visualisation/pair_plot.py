#!/usr/bin/env python3


### Tout revoir de 0 car le fichier a été réalisé par COPILOTE !!!!!!!!

"""
pair_plot.py — Full scatter plot matrix with histograms on the diagonal.

Diagonal  : histogram of each feature, all houses superimposed
Off-diag  : scatter plot of every pair, points coloured by house
Click     : ouvre le subplot en grand dans une fenêtre zoomable

From this visualization:
  - Diagonal histograms → see which features separate houses (multi-modal = good discriminant)
  - Off-diagonal scatter → spot correlated pairs (aligned cloud = redundant features)
  → Keep features whose diagonal shows clearly separated house distributions
  → Drop one of each strongly correlated pair
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
N_BINS = 20


def make_bins(values, n_bins):
    """Compute n_bins uniform bin edges over the range of values (no lib)."""
    lo = min(values)
    hi = max(values)
    if lo == hi:
        return [lo - 0.5, hi + 0.5]
    step = (hi - lo) / n_bins
    return [lo + step * k for k in range(n_bins + 1)]


def bin_counts(values, edges):
    """Count values in each bin defined by edges (manual)."""
    counts = [0] * (len(edges) - 1)
    for v in values:
        for k in range(len(edges) - 1):
            if edges[k] <= v < edges[k + 1]:
                counts[k] += 1
                break
        else:
            counts[-1] += 1   # last bin is closed on the right
    return counts


def draw_histogram(ax, rows_feat, houses, feat_name):
    """Draw overlapping per-house histograms on ax (all manual)."""
    # collect per-house values
    house_vals = {h: [] for h in HOUSE_COLORS}
    for i, h in enumerate(houses):
        v = rows_feat[i]
        if v is not None and h in house_vals:
            house_vals[h].append(v)

    all_vals = [v for vs in house_vals.values() for v in vs]
    if not all_vals:
        return
    edges = make_bins(all_vals, N_BINS)
    width = edges[1] - edges[0]
    centres = [(edges[k] + edges[k + 1]) / 2 for k in range(N_BINS)]

    for house, color in HOUSE_COLORS.items():
        vals = house_vals[house]
        if not vals:
            continue
        counts = bin_counts(vals, edges)
        total = len(vals)
        densities = [c / (total * width) for c in counts]
        ax.bar(centres, densities, width=width * 0.9,
               color=color, alpha=0.5, linewidth=0)

    ax.set_title(feat_name, fontsize=6, pad=2)
    ax.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)


def draw_scatter(ax, rows, houses, feat_x, feat_y):
    """Draw per-house scatter plot on ax."""
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
            ax.scatter(xs, ys, s=1, alpha=0.25,
                       color=color, linewidths=0)
    ax.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)


def open_detail_scatter(feat_x, feat_y, rows, houses):
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
            ax2.scatter(xs, ys, s=8, alpha=0.5, color=color,
                        label=house, linewidths=0)
    ax2.set_xlabel(feat_x)
    ax2.set_ylabel(feat_y)
    ax2.legend(fontsize=8)
    fig2.tight_layout()
    fig2.show()


def open_detail_hist(feat, rows_feat, houses):
    fig2, ax2 = plt.subplots(figsize=(7, 4))
    fig2.suptitle(feat, fontsize=12)
    house_vals = {h: [] for h in HOUSE_COLORS}
    for i, h in enumerate(houses):
        v = rows_feat[i]
        if v is not None and h in house_vals:
            house_vals[h].append(v)
    all_vals = [v for vs in house_vals.values() for v in vs]
    if not all_vals:
        return
    edges = make_bins(all_vals, N_BINS)
    width = edges[1] - edges[0]
    centres = [(edges[k] + edges[k + 1]) / 2 for k in range(N_BINS)]
    for house, color in HOUSE_COLORS.items():
        vals = house_vals[house]
        if not vals:
            continue
        counts = bin_counts(vals, edges)
        total = len(vals)
        densities = [c / (total * width) for c in counts]
        ax2.bar(centres, densities, width=width * 0.9,
                color=color, alpha=0.5, label=house, linewidth=0)
    ax2.set_xlabel(feat)
    ax2.set_ylabel("Density")
    ax2.legend(fontsize=8)
    fig2.tight_layout()
    fig2.show()


def plot_pair(features, rows, houses):
    n = len(features)
    fig, axes = plt.subplots(n, n, figsize=(n * 2, n * 2))
    fig.suptitle(
        "Pair plot — diagonal: distribution par feature  |  hors-diagonale: scatter par paire\n"
        "Clic sur un subplot pour l'agrandir",
        fontsize=10, y=1.01
    )

    for row in range(n):
        for col in range(n):
            ax = axes[row][col]
            feat_row = features[row]
            feat_col = features[col]

            if row == col:
                draw_histogram(ax, rows[feat_row], houses, feat_row)
            else:
                draw_scatter(ax, rows, houses, feat_col, feat_row)

            if col == 0:
                ax.set_ylabel(feat_row, fontsize=5, rotation=30,
                              ha='right', labelpad=2)
            if row == n - 1:
                ax.set_xlabel(feat_col, fontsize=5, rotation=30,
                              ha='right', labelpad=2)

    def on_click(event):
        if event.inaxes is None:
            return
        for r in range(n):
            for c in range(n):
                if event.inaxes is axes[r][c]:
                    if r == c:
                        open_detail_hist(features[r], rows[features[r]], houses)
                    else:
                        open_detail_scatter(features[c], features[r], rows, houses)
                    return

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
        description="Pair plot: distributions + correlations entre toutes les features."
    )
    parser.add_argument("file_path", help="Path to dataset CSV")
    args = parser.parse_args()

    features, rows, houses = get_rows(args.file_path)
    plot_pair(features, rows, houses)
