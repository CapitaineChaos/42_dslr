#!/usr/bin/env python3

import argparse

def get_count_somme(array):
    somme = 0
    count = 0
    for x in array:
        if x is not None:
            count += 1
            somme += x
    return count, somme


def get_full_description(array, feature_name):
    count, somme = get_count_somme(array)
    return {
        "feature": feature_name,
        "count": count,
        "std": (sum((x - (sum(array) / count)) ** 2 for x in array) / count) ** 0.5 if array else 0,
        "mean": sum(array) / count if array else 0,
        "min": min(array) if array else 0,
        "25%": sorted(array)[int(count * 0.25)] if array else 0,
        "50%": sorted(array)[int(count * 0.5)] if array else 0,
        "75%": sorted(array)[int(count * 0.75)] if array else 0,
        "max": max(array) if array else 0,
    }

def get_shifted_data(line, shift):
    features = line.strip().split(',')
    return features[shift:]

# Read lines one by one and collect basics statistics
def read_lines(file_path):
    # lines = 0
    # Features that are not counted
    shift = 6
    with open(file_path, 'r') as file:
        # Header line is not counted
        features = get_shifted_data(file.readline(), shift)
        data = [[] for _ in features]
        descriptions = {feature: {} for feature in features}
        print(f"Data: {data}")
        for line in file:
            if line.strip():
                for i, feature in enumerate(get_shifted_data(line, shift)):
                    # if the feature is a number, add it to the sum and count, otherwise ignore it
                    try:
                        data[i].append(float(feature))
                    except ValueError:
                        pass
        for i, feature in enumerate(features):
            descriptions[i] = get_full_description(data[i], feature)
    return {"features": features, "data": data, "descriptions": descriptions}


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

    # Read the lines from the file
    ret = read_lines(args.file_path)
    descriptions = ret["descriptions"]  
    print(f"Descriptions: {descriptions[0]}")
    print(f"Descriptions: {descriptions[1]}")