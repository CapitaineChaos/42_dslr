ROOT     := $(abspath ..)
VENV     := $(ROOT)/.venv
PY       := $(VENV)/bin/python
STAMP    := $(VENV)/.installed
REQUIREMENTS := $(ROOT)/requirements.txt
DOCDIR   := regression
MASTER   := regression_logistique.tex
SLIDES   := regression_logistique_slides.tex
SLIDES_BODY := $(DOCDIR)/regression_logistique_slides_body.tex
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
	@for gen in $(DOCDIR)/scripts/gen_*.py; do \
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

$(SLIDES_BODY): $(DOCDIR)/scripts/gen_slides_source.py $(DOCDIR)/chapters/*.tex
	$(PY) $(DOCDIR)/scripts/gen_slides_source.py

slides: $(SLIDES_BODY)
	cd $(DOCDIR) && latexmk -synctex=1 -pdf -interaction=nonstopmode \
	  -file-line-error $(SLIDES)

# Contrôle d'accessibilité : PDF balisé, et une alternative par figure.
doc-tag-check: labels doc
	$(PY) $(DOCDIR)/scripts/verifie_alt.py

clean:
	cd $(DOCDIR) && latexmk -C $(MASTER)
	cd $(DOCDIR) && latexmk -C $(SLIDES)
	rm -f $(SLIDES_BODY)
	rm -f $(DOCDIR)/chapters/*.aux
