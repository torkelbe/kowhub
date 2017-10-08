SHELL := /bin/bash

.PHONY: install
install: cp_settings venv dependencies migrate

.PHONY: cp_settings
setup:
	if [ ! -e "kowhub/settings/local.py" ] ; then cp kowhub/settings/local.py.example kowhub/settings/local.py ; fi

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
	find . -type d -empty -delete

.PHONY: clear_venv
clear_venv:
	rm -rf venv

