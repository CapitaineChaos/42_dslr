#!/usr/bin/env python3

import sys
import tkinter as tk
from tkinter import ttk

import pandas as pd

from dslr.data import courses, load
from dslr.stats import describe


def fmt(value: float, stat: str) -> str:
    if pd.isna(value):
        return "None"
    if stat == "Count":
        return f"{int(value)}"
    return f"{value:.6f}"


def disp_data(table: pd.DataFrame) -> None:
    stats = list(table.index)

    root = tk.Tk()
    root.title("Describe")

    columns = ["feature"] + stats
    tree = ttk.Treeview(root, columns=columns, show="headings", height=len(table.columns))

    for col in columns:
        tree.heading(col, text=col.capitalize())
        # Texte à gauche, chiffres à droite
        anchor = "w" if col == "feature" else "e"
        width = 200 if col == "feature" else 110
        tree.column(col, width=width, anchor=anchor)

    for feature in table.columns:
        row = [feature] + [fmt(table[feature][stat], stat) for stat in stats]
        tree.insert("", "end", values=row)

    tree.pack(side="left", fill="both", expand=True)

    # Ctrl+C accessible
    def _keep_alive():
        root.after(200, _keep_alive)
    root.after(200, _keep_alive)

    try:
        root.mainloop()
    except KeyboardInterrupt:
        root.destroy()


def main(path: str) -> None:
    disp_data(describe(courses(load(path))))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(f"usage: {sys.argv[0]} dataset.csv")
    try:
        main(sys.argv[1])
    except (OSError, ValueError) as e:
        sys.exit(f"erreur: {e}")
    except KeyboardInterrupt:
        print("\nCTRL+C")
        sys.exit(130)
