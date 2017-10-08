import os
from fabric.api import *
from armybuilder.kowdatagen import numbers_to_csv, csv_to_json

class Site(object):

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def run(self, cmd):
        with cd(self.dir):
            run(cmd)

    def sudo(self, cmd):
        with cd(self.dir):
            sudo(cmd, user=self.user_id)

    def deploy(self):
        self.git_pull()
        self.upload_data_file()
        self.update_packages()
        self.django_manage('migrate')
        self.django_manage('collectstatic --noinput')
        self.restart()

    def git_pull(self):
        self.run("find . -name '*.pyc' -delete")
        self.run("git fetch origin && git reset --hard origin/master")

    def upload_data_file(self):
        with cd(self.dir):
            put('./armybuilder/data/kowdata.json', 'armybuilder/data')

    def update_packages(self):
        self.run("./kowhubenv/bin/pip install -r requirements.txt")

    def django_manage(self, cmd):
        self.run('kowhubenv/bin/python manage.py ' + cmd)

    def restart(self):
        self.sudo('service gunicorn restart')


PROD = Site(
    dir='/home/torkel/kowhub',
    user_id='torkel'
)

env.hosts = ['kowhub.com']

@task
# Request server to pull latest version from git, apply changes, and restart site
def deploy():
    print "Deploying on " +  " ".join(env.hosts)
    PROD.deploy()

@task
# Handle KoW data source files.
# arg: 'csv' to export from numbers to csv
# arg: 'json' to convert from csv to json
# arg: 'make' to perform both numbers-to-csv and csv-to-json
# arg: 'dry' to do a test run of csv-to-json, and print result to console only
# arg: 'error' to check for errors in csv-to-json file parsing
def data(arg=""):
    if arg.startswith("csv"):
        numbers_to_csv.export_to_csv()
    elif arg.startswith("json"):
        csv_to_json.generate_data(write_to_file=True, write_to_console=False)
    elif arg.startswith("make"):
        numbers_to_csv.export_to_csv()
        csv_to_json.generate_data(write_to_file=True, write_to_console=False)
    elif arg.startswith("update"):
        csv_to_json.generate_data(write_to_file=True, write_to_console=False)
    elif arg.startswith("dry"):
        csv_to_json.generate_data(write_to_file=False, write_to_console=True)
    elif arg.startswith("error"):
        csv_to_json.generate_data(write_to_file=False, write_to_console=False)
    else:
        print "Requires argument (csv|json|make|dry|error)"

@task
def runserver():
    """ Run local server on 127.0.0.1:8000 """
    local("venv/bin/python manage.py runserver")

@task
def servelocal():
    """ Serve local server on 0.0.0.0:8000 """
    local("venv/bin/python manage.py runserver 0.0.0.0:8000")

