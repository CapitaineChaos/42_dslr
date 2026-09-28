import os
from pathlib import Path

import pandas as pd

HOUSE = "Hogwarts House"
HOUSES = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"]


def load(path: str, required: list[str] | tuple[str, ...] = ()) -> pd.DataFrame:
    # https://docs.python.org/3/library/os.html#os.access

    csv = Path(path)
    name = csv.name

    if csv.is_symlink():
        raise OSError(f"{name}: symlink forbidden")
    if not csv.exists():
        raise OSError(f"{name}: not found")
    if not csv.is_file():
        raise OSError(f"{name}: is not a file")
    if not os.access(csv, os.R_OK):
        raise OSError(f"{name}: cannot read file")

    try:
        # Sans round_trip, le parseur rapide de pandas peut se tromper sur le dernier chiffre
        df = pd.read_csv(csv, float_precision="round_trip")
    except pd.errors.EmptyDataError:
        raise ValueError(f"{name}: empty file") from None
    except pd.errors.ParserError as e:
        raise ValueError(f"{name}: malformed csv, {e}") from None
    except UnicodeDecodeError:
        raise ValueError(f"{name}: not a text file") from None

    if df.empty:
        raise ValueError(f"{name}: no data")

    # Un champ de plus que l'en-tête sur chaque ligne : pandas en fait l'index sans rien dire
    if not isinstance(df.index, pd.RangeIndex):
        raise ValueError(f"{name}: malformed csv, more fields than columns")

    for column in required:
        if column not in df.columns:
            raise ValueError(f"{name}: missing column {column}")

    # https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.attrs.html
    df.attrs["name"] = name
    return df


def courses(df: pd.DataFrame) -> pd.DataFrame:
    # https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.select_dtypes.html

    # Hogwarts House vide (dataset_test) est lue comme une colonne de NaN, donc numérique
    numeric = df.drop(columns=["Index", HOUSE], errors="ignore").select_dtypes(include="number")
    if numeric.empty:
        raise ValueError(f"{df.attrs['name']}: no numeric column")
    return numeric


def houses(df: pd.DataFrame) -> pd.Series:
    name = df.attrs["name"]
    if HOUSE not in df.columns:
        raise ValueError(f"{name}: missing column {HOUSE}")

    column = df[HOUSE]
    if column.isna().any():
        raise ValueError(f"{name}: {HOUSE} empty on some lines, this file is not labelled")

    unknown = set(column) - set(HOUSES)
    if unknown:
        raise ValueError(f"{name}: unknown house {', '.join(sorted(unknown))}")
    return column
