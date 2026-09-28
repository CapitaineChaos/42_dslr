VENV    := .venv
PY      := $(VENV)/bin/python
PIP     := $(VENV)/bin/pip
STAMP   := $(VENV)/.installed
DATASET_TEST  := ./datasets/dataset_test.csv
DATASET_TRAIN := ./datasets/dataset_train.csv

DEMO_DIR      := docs/demo
DEMO_DATA     := $(DEMO_DIR)/src/data.js
DEMO_EXPORTER := $(DEMO_DIR)/scripts/exporter_donnees.py
DEMO_SCENARIO := $(DEMO_DIR)/data/scenario.csv
DEMO_BUILDER  := $(DEMO_DIR)/scripts/construire_scenario.py
DEMO_CONTRAST := $(DEMO_DIR)/scripts/verifie_contraste.py
PORT ?= 8000

.PHONY: install train predict describe histogram histograms scatter scatters pair heatmap cross demo contraste clean fclean re

$(STAMP): requirements.txt pyproject.toml
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	$(PIP) install -e . --config-settings editable_mode=compat
	touch $(STAMP)

install: $(STAMP)


train: $(STAMP)
	$(PY) programs/logreg_train.py $(DATASET_TRAIN)

predict: $(STAMP)
	$(PY) programs/logreg_predict.py $(DATASET_TEST) weights.csv

describe: $(STAMP)
	$(PY) programs/describe.py $(DATASET_TEST)

histogram: $(STAMP)
	$(PY) programs/histogram.py $(DATASET_TRAIN)

histograms: $(STAMP)
	$(PY) programs/histograms.py $(DATASET_TRAIN)

scatter: $(STAMP)
	$(PY) programs/scatter_plot.py $(DATASET_TRAIN)

scatters: $(STAMP)
	$(PY) programs/scatter_plots.py $(DATASET_TRAIN)

pair: $(STAMP)
	$(PY) programs/pair_plot.py $(DATASET_TRAIN)

heatmap: $(STAMP)
	$(PY) programs/heatmap.py $(DATASET_TRAIN)

cross: $(STAMP)
	$(PY) programs/cross_validation.py $(DATASET_TRAIN)

# Atelier interactif : aucune compilation, un serveur statique suffit.
$(DEMO_SCENARIO): $(DEMO_BUILDER)
	$(PY) $(DEMO_BUILDER)

$(DEMO_DATA): $(DEMO_EXPORTER) $(DEMO_SCENARIO)
	$(PY) $(DEMO_EXPORTER)

demo: $(STAMP) $(DEMO_DATA)
	@echo "atelier sur http://localhost:$(PORT)/  (Ctrl-C pour arrêter)"
	@cd $(DEMO_DIR) && $(CURDIR)/$(PY) -m http.server $(PORT) --bind 127.0.0.1

contraste: $(STAMP)
	$(PY) $(DEMO_CONTRAST)

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +

fclean: clean
	rm -rf $(VENV) dslr.egg-info

re: fclean install
