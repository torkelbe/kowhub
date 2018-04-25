SHELL := /bin/bash

.PHONY: install
install: cpsecret venv dependencies migrate node_modules

.PHONY: cpsecret
cpsecret:
	[ ! -e "django/config/settings/secrets.json" ] && \
		cp django/config/settings/secrets.json.example django/config/settings/secrets.json

.PHONY: venv
venv:
	cd django && [ ! -e "venv/bin/activate_this.py" ] && virtualenv --clear venv

.PHONY: dependencies
dependencies:
	cd django && venv/bin/pip install -r requirements/local.txt

.PHONY: prod-dependencies
prod-dependencies:
	cd django && venv/bin/pip install -r requirements/production.txt

.PHONY: node_modules
node_modules:
	cd frontend && yarn install

.PHONY: migrate
migrate:
	cd django && venv/bin/python manage.py migrate --settings=config.settings.local

.PHONY: freeze
freeze:
	cd django && venv/bin/pip freeze > requirements/constraints.txt

.PHONY: clean
clean: clear_files clear_venv clear_modules

.PHONY: clear_files
clear_files:
	find . -name '*.pyc' -delete
	find . -name '__pycache__' -delete

.PHONY: clear_venv
clear_venv:
	rm -rf django/venv

.PHONY: clear_modules
clear_modules:
	rm -rf frontend/node_modules

