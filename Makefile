VENV    := .venv
PY      := $(VENV)/bin/python
PIP     := $(VENV)/bin/pip
STAMP   := $(VENV)/.installed
DATASET_TEST  := ./datasets/dataset_test.csv
DATASET_TRAIN := ./datasets/dataset_train.csv

.PHONY: install describe histogram scatter pair clean fclean re


$(STAMP): requirements.txt
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	touch $(STAMP)

install: $(STAMP)


describe: $(STAMP)
	$(PY) V.1_Data_Analysis/describe.py $(DATASET_TEST)

histogram: $(STAMP)
	$(PY) V.2_Data_Visualisation/trace_histogram.py $(DATASET_TRAIN)

scatter: $(STAMP)
	$(PY) V.2_Data_Visualisation/trace_scatter_plot.py $(DATASET_TRAIN)

pair: $(STAMP)
	$(PY) V.2_Data_Visualisation/trace_pair_plot.py $(DATASET_TRAIN)

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +

fclean: clean
	rm -rf $(VENV)

re: fclean install
