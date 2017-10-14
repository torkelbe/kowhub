SHELL := /bin/bash

.PHONY: install
install: cpsecret venv dependencies migrate node_modules

.PHONY: cpsecret
cpsecret:
	[ ! -e "config/settings/secrets.json" ] && \
		cp config/settings/secrets.json.example config/settings/secrets.json

.PHONY: venv
venv:
	[ ! -e "venv/bin/activate_this.py" ] && virtualenv --clear venv

.PHONY: dependencies
dependencies:
	venv/bin/pip install -r requirements.txt

.PHONY: node_modules
node_modules:
	cd reactapp && yarn install

.PHONY: migrate
migrate:
	venv/bin/python manage.py migrate --settings=config.settings.local

.PHONY: freeze
freeze:
	source venv/bin/activate && venv/bin/pip freeze > requirements.txt

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

