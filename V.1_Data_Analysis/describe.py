#!/usr/bin/env python3

import argparse


def get_shifted_data(line, shift):
    features = line.strip().split(',')
    return features[shift:]

# Read lines one by one and collect basics statistics
def read_lines(file_path):
    lines = 0
    # Features that are not counted
    shift = 6
    with open(file_path, 'r') as file:
        # Header line is not counted
        features = get_shifted_data(file.readline(), shift)
        data = [[] for _ in features]
        sums = [0 for _ in features]
        counts = [0 for _ in features]
        ignore = 0
        print(f"Data: {data}")
        for line in file:
            if line.strip():
                for i, feature in enumerate(get_shifted_data(line, shift)):
                    # if the feature is a number, add it to the sum and count, otherwise ignore it
                    try:
                        sums[i] += float(feature)
                        counts[i] += 1
                        data[i].append(feature)
                    except ValueError:
                        ignore = ignore + 1
                        pass
                lines = lines + 1
    print(f"Features: {features}")
    print(f"Data: {data}")
    print(f"Sums: {sums}")
    print(f"Counts: {counts}")
    print(f"Total number of lines: {lines}")
    print(f"Total number of ignored features: {ignore}")

    return lines


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
    total_lines = read_lines(args.file_path)
