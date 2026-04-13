#!/usr/bin/env python3

### Tout revoir de 0 car le fichier a été réalisé par COPILOTE !!!!!!!!

"""
histogram.py — Which Hogwarts course has the most homogeneous scores across houses?

Displays a histogram for each course, with one colour per house.
The course with the most similar distributions across houses (lowest η²) is the answer.
"""


import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from describe_modified import get_data_from_lines

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


def plot_histograms(data, features):
    n = len(features)
    ncols = 4
    nrows = (n + ncols - 1) // ncols

    fig, axes = plt.subplots(nrows, ncols, figsize=(20, nrows * 3.5))
    fig.suptitle("lower η² = more homogeneous across houses", fontsize=13, y=1.01)
    axes_flat = axes.flatten()

    for ax, feat in zip(axes_flat, features):
        house_vals = data[feat]
        for house, color in HOUSE_COLORS.items():
            vals = house_vals.get(house, [])
            if vals:
                ax.hist(vals, bins=20, alpha=0.5, color=color, label=house, density=True)

        title_color = "black"
        ax.set_title(f"{feat}", fontsize=8,
                     color=title_color, fontweight="normal")
        ax.set_xlabel("Score", fontsize=7)
        ax.set_ylabel("Density", fontsize=7)
        ax.tick_params(labelsize=6)

    # Hide unused subplots
    for ax in axes_flat[n:]:
        ax.set_visible(False)

    # Shared legend
    legend_handles = [
        mpatches.Patch(color=color, label=house)
        for house, color in HOUSE_COLORS.items()
    ]
    fig.legend(handles=legend_handles, loc="lower center", ncol=4,
               fontsize=9, bbox_to_anchor=(0.5, -0.02))

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Histogram: which course has homogeneous scores across houses?"
    )
    parser.add_argument("file_path", help="Path to dataset CSV")
    args = parser.parse_args()

    data, features = get_data_from_lines(args.file_path)
    plot_histograms(data, features)
