"""Vérifie l'unicité des labels dans les sources LaTeX du document."""

from collections import defaultdict
import glob
import os
import re
import sys


HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.abspath(os.path.join(HERE, ".."))
LABEL = re.compile(r"\\label\{([^{}]+)\}")


def source_without_comments(line):
    """Retire un commentaire LaTeX, mais conserve les pourcentages échappés."""
    for index, char in enumerate(line):
        if char != "%":
            continue
        backslashes = 0
        cursor = index - 1
        while cursor >= 0 and line[cursor] == "\\":
            backslashes += 1
            cursor -= 1
        if backslashes % 2 == 0:
            return line[:index]
    return line


def main():
    occurrences = defaultdict(list)
    sources = [os.path.join(DOC, "regression_logistique.tex")]
    sources.extend(glob.glob(os.path.join(DOC, "chapters", "*.tex")))

    for path in sorted(sources):
        with open(path, encoding="utf-8") as source:
            for line_number, line in enumerate(source, 1):
                for match in LABEL.finditer(source_without_comments(line)):
                    occurrences[match.group(1)].append((path, line_number))

    duplicates = {
        label: positions
        for label, positions in occurrences.items()
        if len(positions) > 1
    }
    if duplicates:
        for label, positions in sorted(duplicates.items()):
            print(f"label dupliqué : {label}", file=sys.stderr)
            for path, line_number in positions:
                print(
                    f"  {os.path.relpath(path, DOC)}:{line_number}",
                    file=sys.stderr,
                )
        sys.exit(1)

    print(f"labels uniques     {len(occurrences)}")


if __name__ == "__main__":
    main()
