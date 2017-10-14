SHELL := /bin/bash

.PHONY: install
install: cpsecret venv dependencies migrate node_modules

.PHONY: cpsecret
cpsecret:
	if [ ! -e "config/settings/secrets.json" ] ; then cp config/settings/secrets.json.example config/settings/secrets.json ; fi

.PHONY: venv
venv:
	if [ ! -e "venv/bin/activate_this.py" ] ; then PYTHONPATH=venv ; virtualenv --clear venv ; fi

.PHONY: dependencies
dependencies:
	PYTHONPATH=venv ; venv/bin/pip install -r requirements.txt

.PHONY: node_modules
node_modules:
	cd reactapp; yarn install

.PHONY: migrate
migrate:
	PYTHONPATH=venv ; venv/bin/python manage.py migrate

.PHONY: freeze
freeze:
	PYTHONPATH=venv ; source venv/bin/activate && venv/bin/pip freeze > requirements.txt

.PHONY: clean
clean: clear_files clear_venv clear_modules clear_bundles

.PHONY: clear_files
clear_files:
	find . -name '*.pyc' -delete
	find . -name '__pycache__' -delete

.PHONY: clear_venv
clear_venv:
	rm -rf venv

.PHONY: clear_modules
clear_modules:
	rm -rf reactapp/node_modules

.PHONY: clear_bundles
clear_bundles:
	rm reactapp/bundles/*.js

