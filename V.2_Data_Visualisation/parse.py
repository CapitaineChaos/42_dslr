#!/usr/bin/env python3

import argparse


def parse_header(line, shift):
    return line.strip().split(',')[shift:]


def parse_data_line(line, shift):
    cols = line.strip().split(',')
    return cols[1], cols[shift:]


def get_rows(file_path):
    shift = 6
    with open(file_path, 'r') as file:
        features = parse_header(file.readline(), shift)
        if not features:
            raise ValueError("empty file or no describable columns")
        rows = {feature: [] for feature in features}
        houses = []
        for line in file:
            if not line.strip():
                continue
            house, values = parse_data_line(line, shift)
            houses.append(house)
            for feature, raw_val in zip(features, values):
                try:
                    rows[feature].append(float(raw_val))
                except ValueError:
                    rows[feature].append(None)
    return features, rows, houses


def load_rows(file_path):
    try:
        return get_rows(file_path)
    except FileNotFoundError:
        print(f"Error: file not found: {file_path}")
    except PermissionError:
        print(f"Error: permission denied: {file_path}")
    except IsADirectoryError:
        print(f"Error: is a directory: {file_path}")
    except (ValueError, UnicodeDecodeError) as e:
        print(f"Error: invalid file '{file_path}': {e}")
    except Exception as e:
        print(f"Error: {e}")
    exit(1)
