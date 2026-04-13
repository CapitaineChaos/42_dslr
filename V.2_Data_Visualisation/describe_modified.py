#!/usr/bin/env python3

import argparse

def get_count_sum_(array):
    sum_ = 0
    count = 0
    min_ = float('inf')
    max_ = float('-inf')
    for x in array:
        if x is not None:
            if x > max_:
                max_ = x
            if x < min_:
                min_ = x
            count += 1
            sum_ += x
    return count, sum_
 

def get_full_description(array, feature_name):
    count, total = get_count_sum_(array)
    if count == 0:
        return {"feature": feature_name, "count": 0, "mean": 0, "std": 0,
                "min": 0, "25%": 0, "50%": 0, "75%": 0, "max": 0}
    clean = [x for x in array if x is not None]
    mean = total / count
    sorted_arr = sorted(clean)
    std = (sum((x - mean) ** 2 for x in clean) / count) ** 0.5
    return {
        "feature": feature_name,
        "count": count,
        "mean": mean,
        "std": std,
        "min": sorted_arr[0],
        "25%": sorted_arr[int(count * 0.25)],
        "50%": sorted_arr[int(count * 0.5)],
        "75%": sorted_arr[int(count * 0.75)],
        "max": sorted_arr[-1],
    }

def parse_header(line, shift):
    cols = line.strip().split(',')
    return cols[shift:]

def parse_data_line(line, shift):
    cols = line.strip().split(',')
    house = cols[1]          # column 1 is Hogwarts House
    values = cols[shift:]
    return house, values

def start_analysis(data, features):
    descriptions = {}
    for feature in features:
        houses_stats = {}
        for house, values in data[feature].items():
            houses_stats[house] = get_full_description(values, feature)
        all_values = []
        for house_values in data[feature].values():
            all_values.extend(house_values)
        descriptions[feature] = {
            'Houses': houses_stats,
            'Overall': get_full_description(all_values, feature),
        }

    return {"features": features, "data": data, "descriptions": descriptions}

def get_rows(file_path):
    """Return (features, rows, houses) where:
    - rows[feature] = [float or None, ...]  one entry per student, CSV order
    - houses        = [str, ...]            house per student, same order
    """
    shift = 6
    with open(file_path, 'r') as file:
        features = parse_header(file.readline(), shift)
        rows = {feature: [] for feature in features}
        houses = []
        for line in file:
            if not line.strip():
                continue
            house, values = parse_data_line(line, shift)
            houses.append(house)
            for feature, raw_val in zip(features, values):
                try:
                    val = float(raw_val)
                except ValueError:
                    val = None
                rows[feature].append(val)
    return features, rows, houses


# Read lines one by one and collect basic statistics
def get_data_from_lines(file_path):
    shift = 6
    with open(file_path, 'r') as file:
        features = parse_header(file.readline(), shift)

        # data[feature][house] = [float values]
        data = {feature: {} for feature in features}

        for line in file:
            if not line.strip():
                continue
            house, values = parse_data_line(line, shift)
            for feature, raw_val in zip(features, values):
                try:
                    val = float(raw_val)
                except ValueError:
                    continue
                if house not in data[feature]:
                    data[feature][house] = []
                data[feature][house].append(val)

    return data, features


# Entry point for the script
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Describe the contents of a file.")
    parser.add_argument("file_path", help="Path to the file to be described")
    args = parser.parse_args()

    if not args.file_path:
        parser.print_help()
        exit(1)

    data, features = get_data_from_lines(args.file_path)
    descriptions = start_analysis(data, features)["descriptions"]

    def fmt(stats):
        return (f"count={stats['count']}, mean={stats['mean']:.2f}, "
                f"std={stats['std']:.2f}, min={stats['min']:.2f}, "
                f"25%={stats['25%']:.2f}, 50%={stats['50%']:.2f}, "
                f"75%={stats['75%']:.2f}, max={stats['max']:.2f}")

    for feature, entry in descriptions.items():
        print(f"\n=== {feature} ===")
        print(f"  Houses:")
        for house, stats in sorted(entry['Houses'].items()):
            print(f"    {house}: {fmt(stats)}")
        print(f"  Overall: {fmt(entry['Overall'])}")