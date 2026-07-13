#!/usr/bin/env python3

import argparse
import sys
import os
import signal
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



def plot_histograms(data, features):
    n = len(features)
    ncols = 5
    nrows = 3

    fig, axes = plt.subplots(nrows, ncols, figsize=(20, nrows * 3.5), layout="constrained")
    axes_flat = axes.flatten()

    for ax, feat in zip(axes_flat, features):
        house_vals = data[feat]
        for house, color in HOUSE_COLORS.items():
            vals = house_vals.get(house, [])
            if vals:
                ax.hist(vals, bins=20, alpha=0.5, color=color, label=house, density=True)

        ax.set_title( f"{feat}", fontsize=8)
        ax.tick_params(labelsize=6)
        ax.tick_params(labelleft=False, left=False)
        ax.yaxis.offsetText.set_visible(False)

    fig.supxlabel("Score", fontsize=9)
    fig.supylabel("Density", fontsize=9)

    # Hide unused subplots
    for ax in axes_flat[n:]:
        ax.set_visible(False)

    # Shared legend
    legend_handles = [
        mpatches.Patch(color=color, label=house)
        for house, color in HOUSE_COLORS.items()
    ]

    fig.legend(handles=legend_handles, loc="outside lower center", ncol=4, fontsize=9)


    signal.signal(signal.SIGINT, signal.SIG_DFL)
    plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Histogram: which course has homogeneous scores across houses?"
    )
    parser.add_argument("file_path", help="Path to dataset CSV")
    args = parser.parse_args()

    features, rows, houses = load_rows(args.file_path)
    data = {feat: {} for feat in features}
    for feat in features:
        for house, value in zip(houses, rows[feat]):
            if value is not None:
                data[feat].setdefault(house, []).append(value)
    plot_histograms(data, features)
