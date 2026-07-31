#!/usr/bin/env python3


class DataError(Exception):
    """Unusable input file. The message carries file[:line]: reason."""
    pass


class ModelError(Exception):
    """Training cannot produce a usable model out of these values."""
    pass
