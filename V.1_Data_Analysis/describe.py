#!/usr/bin/env python3

import argparse
import os
import sys
import tkinter as tk
from tkinter import ttk

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'V.0_Common'))

from csvfile import read_table
from errors import DataError
from stats import Stats


# Collect basic statistics on every column past the identity ones
def read_lines(file_path):
    shift = 6
    header, rows = read_table(file_path)
    features = header[shift:]
    if not features:
        raise DataError(f"{file_path}: no describable column")

    data = [[] for _ in features]
    for fields in rows:
        for i, value in enumerate(fields[shift:]):
            # a non numeric cell is left out of its column, as pandas does
            try:
                data[i].append(float(value))
            except ValueError:
                pass
    return {feature: Stats(data[i]).describe() for i, feature in enumerate(features)}


def fmt(value, stat):
    if value is None:
        return "None"
    if stat == "count":
        return f"{value}"
    return f"{value:.6f}"


def disp_data(descriptions):
    stats = Stats.KEYS

    root = tk.Tk()
    root.title("Describe")

    columns = ["feature"] + list(stats)
    tree = ttk.Treeview(root, columns=columns, show="headings", height=len(descriptions))

    for col in columns:
        tree.heading(col, text=col.capitalize())
        # Texte à gauche, chiffres à droite
        anchor = "w" if col == "feature" else "e"
        width = 200 if col == "feature" else 110
        tree.column(col, width=width, anchor=anchor)

    for feature, values in descriptions.items():
        row = [feature] + [fmt(values[stat], stat) for stat in stats]
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



# Entry point for the script
if __name__ == "__main__":
    # Get the arguments from the command line
    parser = argparse.ArgumentParser(description="Describe the contents of a file.")
    parser.add_argument("file_path", help="Path to the file to be described")
    args = parser.parse_args()

    # If no arguments are provided, print the help message
    if not args.file_path:
        parser.print_help()
        exit(1)
    
    # If too many arguments are provided, print the help message
    if len(vars(args)) > 1:
        print("Too many arguments provided.")
        parser.print_help()
        exit(1)

    try:
        # Read the lines from the file
        ret = read_lines(args.file_path)
        disp_data(ret)
    except KeyboardInterrupt:
        print("\nInterrupted")
        exit(130)
    except DataError as err:
        print(f"Error: {err}", file=sys.stderr)
        exit(1)
