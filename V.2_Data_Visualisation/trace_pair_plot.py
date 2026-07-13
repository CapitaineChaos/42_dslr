#!/usr/bin/env python3

import argparse
import sys
import os
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from parse import load_rows


HOUSE_COLORS = {
    "Gryffindor": "#C1121F",
    "Hufflepuff": "#E9C46A",
    "Ravenclaw":  "#457B9D",
    "Slytherin":  "#2D6A4F",
}
N_BINS = 20


def group_by_house(rows_feat, houses):
    hv = {h: [] for h in HOUSE_COLORS}
    for h, v in zip(houses, rows_feat):
        if v is not None and h in hv:
            hv[h].append(v)
    return hv


def draw_hist(ax, rows_feat, houses, labels=False):
    hv = group_by_house(rows_feat, houses)
    all_vals = [v for vs in hv.values() for v in vs]
    if not all_vals:
        return
    lo, hi = min(all_vals), max(all_vals)
    if lo == hi:
        lo, hi = lo - 0.5, hi + 0.5
    for house, color in HOUSE_COLORS.items():
        vals = hv[house]
        if vals:
            ax.hist(vals, bins=N_BINS, range=(lo, hi), density=True,
                    color=color, alpha=0.5, linewidth=0,
                    label=house if labels else None)


def draw_histogram(ax, rows_feat, houses, feat_name):
    draw_hist(ax, rows_feat, houses)
    ax.set_title(feat_name, fontsize=6, pad=2)
    ax.tick_params(left=False, bottom=False, labelleft=False, labelbottom=False)


def draw_scatter(ax, rows, houses, feat_x, feat_y):
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
            ax.scatter(xs, ys, s=1, alpha=0.25, color=color, linewidths=0)
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
    draw_hist(ax2, rows_feat, houses, labels=True)
    ax2.set_xlabel(feat)
    ax2.set_ylabel("Density")
    ax2.legend(fontsize=8)
    fig2.tight_layout()
    fig2.show()


def plot_pair(features, rows, houses):
    n = len(features)
    fig, axes = plt.subplots(n, n, figsize=(n * 2, n * 2))

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
                ax.set_ylabel(feat_row, fontsize=5, rotation=30, ha='right', labelpad=2)
            if row == n - 1:
                ax.set_xlabel(feat_col, fontsize=5, rotation=30, ha='right', labelpad=2)

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
    fig.legend(handles=legend_handles, loc="upper right", fontsize=8, bbox_to_anchor=(1.0, 1.0))

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Pair plot: distributions + correlations entre toutes les features."
    )
    parser.add_argument("file_path", help="Path to dataset CSV")
    args = parser.parse_args()

    features, rows, houses = load_rows(args.file_path)
    plot_pair(features, rows, houses)
