SHELL := /bin/bash

.PHONY: install
install: setup venv dependencies

.PHONY: setup
setup:
	if [ ! -e "kowhub/settings/local.py" ] ; then cp kowhub/settings/local.py.example kowhub/settings/local.py ; fi

.PHONY: venv
venv:
	if [ ! -e "venv/bin/activate_this.py" ] ; then PYTHONPATH=venv ; virtualenv --clear venv ; fi

.PHONY: dependencies
dependencies:
	PYTHONPATH=venv ; . venv/bin/activate && venv/bin/pip install -r requirements.txt

.PHONY: freeze
freeze:
	. venv/bin/activate && venv/bin/pip freeze > requirements.txt

.PHONY: clean
clean: clear_venv
	find . -name '*.pyc' -delete
	find . -name '__pycache__' -delete
	find . -type d -empty -delete

.PHONY: clear_venv
clear_venv:
	rm -rf venv

