#!/usr/bin/env python3
"""Plain CSV reader: these files hold no quoted field, so splitting on the comma is enough."""

from errors import DataError


def read_lines(file_path):
    try:
        # utf-8-sig also accepts the BOM a spreadsheet export may leave
        with open(file_path, 'r', encoding='utf-8-sig') as file:
            return file.read().splitlines()
    except UnicodeDecodeError:
        raise DataError(f"{file_path}: expected utf-8 text") from None
    except OSError as err:
        raise DataError(f"{file_path}: {err.strerror or err}") from None


def read_table(file_path):
    """Return the header and the split lines, all as long as the header. Data row i sits on file line i + 2."""
    lines = read_lines(file_path)
    if not lines:
        raise DataError(f"{file_path}: empty file")

    header = lines[0].split(',')
    if len(set(header)) != len(header):
        raise DataError(f"{file_path}:1: duplicated column")

    rows = []
    for line_no, line in enumerate(lines[1:], start=2):
        if not line.strip():
            raise DataError(f"{file_path}:{line_no}: empty line")
        fields = line.split(',')
        if len(fields) != len(header):
            raise DataError(f"{file_path}:{line_no}: {len(fields)} fields instead of {len(header)}")
        rows.append(fields)

    if not rows:
        raise DataError(f"{file_path}: no data line")
    return header, rows
