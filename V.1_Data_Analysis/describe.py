#!/usr/bin/env python3

import argparse
from functools import reduce
import tkinter as tk
from tkinter import ttk


def get_count(array):
    sum_ = 0
    count = 0
    for x in array:
        if x is not None:
            count += 1
            sum_ += x
    return count, sum_

def get_full_description(array):
    _count, _sum = get_count(array)
    _mean = _sum / _count if array else None
    _std = (reduce(lambda acc, val: acc + (val - _mean) ** 2, array, 0) / _count) ** 0.5 if array else None
    _sorted = sorted(array)
    _min = _sorted[0] if array else None
    _max = _sorted[-1] if array else None
    _25p = _sorted[int(_count * 0.25)] if array else None
    _50p = _sorted[int(_count * 0.50)] if array else None
    _75p = _sorted[int(_count * 0.75)] if array else None
    return {
        "count": _count,
        "std":   _std,
        "mean":  _mean,
        "min":   _min,
        "25%":   _25p,
        "50%":   _50p,
        "75%":   _75p,
        "max":   _max,
    }

def get_shifted_data(line, shift):
    features = line.strip().split(',')
    return features[shift:]

# Read lines one by one and collect basics statistics
def read_lines(file_path):
    # lines = 0
    # Features that are not counted, columns count
    shift = 6
    with open(file_path, 'r') as file:
        # Header line is not counted
        features = get_shifted_data(file.readline(), shift)
        data = [[] for _ in features]
        descriptions = {feature: {} for feature in features}
        for line in file:
            if line.strip():
                for i, feature in enumerate(get_shifted_data(line, shift)):
                    # if the feature is a number, add it to the sum and count, otherwise ignore it
                    try:
                        data[i].append(float(feature))
                    except:
                        pass
        for i, feature in enumerate(features):
            descriptions[feature] = get_full_description(data[i])
    return descriptions


def fmt(value, stat):
    if value is None:
        return "None"
    if stat == "count":
        return f"{value}"
    return f"{value:.6f}"


def disp_data(descriptions):
    stats = ("count", "std", "mean", "min", "25%", "50%", "75%", "max")

    root = tk.Tk()
    root.title("Describe")

    columns = ["feature"] + list(stats)
    tree = ttk.Treeview(root, columns=columns, show="headings", height=len(descriptions))

    for col in columns:
        tree.heading(col, text=col.capitalize())
        # Texte a gauche, chiffres a droite
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
        # descriptions = ret["descriptions"]
        disp_data(ret)
    except KeyboardInterrupt:
        print("\nInterrupted")
    except Exception as e:
        print(f"Error: {e}")
