#!/usr/bin/env python3
"""The Hogwarts dataset: expected columns, known houses, unique Index. Any other tabular file goes through csvfile alone."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from csvfile import read_table
from errors import DataError

HOUSES = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]
HEAD = ["Index", "Hogwarts House", "First Name", "Last Name", "Birthday", "Best Hand"]


class Data:
    # Index, Hogwarts House, First Name, Last Name, Birthday, Best Hand
    FIRST_COURSE = 6

    def __init__(self, file_path):
        self.file_path = file_path
        self.index = []
        self.houses = []
        self.courses = {}
        self.missing = {}
        self.read_data()

    def error(self, line_no, message):
        return DataError(f"{self.file_path}:{line_no}: {message}")

    def read_header(self, header):
        if header[:self.FIRST_COURSE] != HEAD:
            raise self.error(1, f"unexpected header: {','.join(header[:self.FIRST_COURSE])}")
        names = header[self.FIRST_COURSE:]
        if not names:
            raise self.error(1, "no course column")
        return names

    def read_data(self):
        header, rows = read_table(self.file_path)
        names = self.read_header(header)
        self.courses = {name: [] for name in names}
        self.missing = {name: 0 for name in names}
        seen = set()

        for offset, fields in enumerate(rows):
            line_no = offset + 2

            # Record student's index
            try:
                index = int(fields[0])
            except ValueError:
                raise self.error(line_no, f"invalid Index: {fields[0]!r}") from None
            if index in seen:
                raise self.error(line_no, f"duplicated Index: {index}")
            seen.add(index)
            self.index.append(index)

            # Record student's house, empty in dataset_test.csv
            house = fields[1]
            if house and house not in HOUSES:
                raise self.error(line_no, f"unknown house: {house!r}")
            self.houses.append(house or None)

            # Record student's courses
            for name, value in zip(names, fields[self.FIRST_COURSE:]):
                if not value:
                    self.courses[name].append(None)
                    self.missing[name] += 1
                    continue
                try:
                    self.courses[name].append(float(value))
                except ValueError:
                    raise self.error(line_no, f"{name}: {value!r} is not a number") from None

        labelled = sum(1 for house in self.houses if house)
        if labelled not in (0, len(self.houses)):
            raise DataError(f"{self.file_path}: Hogwarts House filled on {labelled} lines out of {len(self.houses)}")

    def features(self):
        return list(self.courses)
