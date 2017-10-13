SHELL := /bin/bash

.PHONY: install
install: venv dependencies migrate

.PHONY: venv
venv:
	if [ ! -e "venv/bin/activate_this.py" ] ; then PYTHONPATH=venv ; virtualenv --clear venv ; fi

.PHONY: dependencies
dependencies:
	PYTHONPATH=venv ; venv/bin/pip install -r requirements.txt

.PHONY: migrate
migrate:
	PYTHONPATH=venv ; venv/bin/python manage.py migrate

.PHONY: freeze
freeze:
	PYTHONPATH=venv ; source venv/bin/activate && venv/bin/pip freeze > requirements.txt

.PHONY: clean
clean: clear_files clear_venv

.PHONY: clear_files
clear_files:
	find . -name '*.pyc' -delete
	find . -name '__pycache__' -delete

.PHONY: clear_venv
clear_venv:
	rm -rf venv

