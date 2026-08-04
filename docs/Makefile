ROOT     := $(abspath ..)
VENV     := $(ROOT)/.venv
PY       := $(VENV)/bin/python
STAMP    := $(VENV)/.installed
REQUIREMENTS := $(ROOT)/requirements.txt
DOCDIR   := regression
MASTER   := regression_logistique.tex
# Le diaporama est un livrable autonome : sources, données et scripts vivent
# tous sous docs/slides et ne partagent rien avec le document principal.
SLIDEDIR := slides
SLIDES   := diaporama.tex
SLIDES_BODY := $(SLIDEDIR)/corps.tex
SLIDES_CONTENT := $(SLIDEDIR)/contenu.tex
SLIDES_VALUES := $(SLIDEDIR)/valeurs.tex
SLIDES_GENERATOR := $(SLIDEDIR)/scripts/assembler_corps.py
MICRO_BUILDER := $(SLIDEDIR)/scripts/construire_cas.py
MICRO_DATA := $(SLIDEDIR)/data/eleves.csv
MICRO_CALCULATIONS := $(SLIDEDIR)/data/calculs.csv
TUTO     := $(DOCDIR)/scripts/tuto

.PHONY: all install tuto verify figures labels tex-memory doc slides doc-tag-check clean

all: doc

$(STAMP): $(REQUIREMENTS)
	$(MAKE) -C $(ROOT) install

install: $(STAMP)

tuto: $(STAMP)
	@for step in $(TUTO)/step0_prepare.py $(TUTO)/step[1-9]_*.py \
	             $(TUTO)/step10_*.py $(TUTO)/transfert_micro.py; do \
	  echo "=== $$step ==="; \
	  (cd $(TUTO) && $(PY) $$(basename $$step)) || exit 1; \
	done

verify: $(STAMP)
	$(PY) $(DOCDIR)/scripts/verifie_chiffres.py

figures: $(STAMP)
	@for gen in $(wildcard $(DOCDIR)/scripts/gen_*.py); do \
	  echo "=== $$gen ==="; $(PY) $$gen || exit 1; \
	done

labels: $(STAMP)
	$(PY) $(DOCDIR)/scripts/verifie_labels.py

# Le balisage PDF (tagpdf, phase-III) construit en mémoire l'arbre de structure
# du document entier : la taille par défaut de pdfTeX n'y suffit pas. La valeur
# est posée dans l'arbre TeX Live de l'utilisateur, puis le format est redumpé.
TEXMFLOCAL := $(shell kpsewhich -var-value SELFAUTOPARENT)/texmf-local

tex-memory:
	@mkdir -p $(TEXMFLOCAL)/web2c
	@printf '%% Balisage PDF : l arbre de structure dépasse la mémoire par défaut.\nmain_memory = 12000000\n' \
	  > $(TEXMFLOCAL)/web2c/texmf.cnf
	@fmtutil-user --byfmt pdflatex >/dev/null
	@echo "format pdflatex redumpé avec main_memory = 12000000"

doc:
	cd $(DOCDIR) && latexmk -synctex=1 -pdf -interaction=nonstopmode \
	  -file-line-error $(MASTER)

$(SLIDES_VALUES): $(MICRO_BUILDER) $(MICRO_DATA) | $(STAMP)
	$(PY) $(MICRO_BUILDER)

$(SLIDES_BODY): $(SLIDES_GENERATOR) $(MICRO_BUILDER) $(MICRO_DATA) \
                $(SLIDES_CONTENT) $(SLIDES_VALUES) | $(STAMP)
	$(PY) $(MICRO_BUILDER)
	$(PY) $(SLIDES_GENERATOR)

slides: $(SLIDES_BODY)
	cd $(SLIDEDIR) && latexmk -synctex=1 -pdf -interaction=nonstopmode \
	  -file-line-error $(SLIDES)

# Contrôle d'accessibilité : PDF balisé, et une alternative par figure.
doc-tag-check: labels doc
	$(PY) $(DOCDIR)/scripts/verifie_alt.py

clean:
	cd $(DOCDIR) && latexmk -C $(MASTER)
	cd $(SLIDEDIR) && latexmk -C $(SLIDES)
	rm -f $(SLIDES_BODY)
	rm -f $(SLIDES_VALUES)
	rm -f $(MICRO_CALCULATIONS)
	rm -f $(DOCDIR)/chapters/*.aux
