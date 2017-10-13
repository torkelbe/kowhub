import os
from fabric.api import *
from fabric.contrib.console import confirm
from kowdatagen.numbers_to_csv import export_to_csv
from kowdatagen.csv_to_json import generate_data

class Site(object):

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def run(self, cmd):
        with cd(self.dir):
            run(cmd)

    def deploy(self):
        self.git_pull()
        self.upload_data_file()
        self.update_packages()
        self.django_manage('migrate')
        self.django_manage('collectstatic --noinput')
        self.restart()

    def git_pull(self):
        self.run("find . -name '*.pyc' -delete")
        self.run("cd kowhub && git fetch origin && git reset --hard origin/master")

    def upload_data_file(self):
        with cd(self.dir):
            put('armybuilder/data/kowdata.json', 'kowhub/armybuilder/data/')

    def update_packages(self):
        self.run("venv/bin/pip install -r kowhub/requirements.txt")

    def django_manage(self, cmd):
        self.run('venv/bin/python kowhub/manage.py ' + cmd)

    def restart(self):
        self.run('sudo supervisorctl restart kowhub')


PROD = Site(
    dir='/webapps/kowhub_django',
)

env.use_ssh_config=True
env.hosts = ['kowhub-webserver']

@task
def help():
    """ Simple help print """
    print "Run a task with arguments using '$ fab task:argument'"
    print "Suppress Fabric output with '--hide=running'"
    with hide("running"): local("fab --list")

@task
def deploy():
    """ Deploy latest version to www.kowhub.com """
    print "Latest version will be deployed to www.kowhub.com"
    if confirm("Do you wish to continue?"):
        print "Deploying on " +  " ".join(env.hosts)
        PROD.deploy()

@task
def data(arg=""):
    """ Manage source data. Use argument (csv|json|make|dry|error|upload)
    - 'csv'   to export from numbers to csv
    - 'json'  to convert from csv to json
    - 'make'  to perform both numbers-to-csv and csv-to-json
    - 'dry'   to do a test run of csv-to-json, and print result to console only
    - 'error' to check for errors in csv-to-json file parsing
    """
    if arg.startswith("csv"):
        export_to_csv()
    elif arg.startswith("json"):
        generate_data(write_to_file=True, write_to_console=False)
    elif arg.startswith("make"):
        export_to_csv()
        generate_data(write_to_file=True, write_to_console=False)
    elif arg.startswith("update"):
        generate_data(write_to_file=True, write_to_console=False)
    elif arg.startswith("dry"):
        generate_data(write_to_file=False, write_to_console=True)
    elif arg.startswith("error"):
        generate_data(write_to_file=False, write_to_console=False)
    elif arg == "upload":
        print "New data file will be uploaded to kowhub.com"
        if confirm("Do you wish to continue?"):
            PROD.upload_data_file()
    else:
        print "Requires argument (csv|json|make|dry|error|upload)"

@task
def runserver():
    """ Run local server on 127.0.0.1:8000 """
    local("venv/bin/python manage.py runserver")

@task
def servelocal():
    """ Serve local server on 0.0.0.0:8000 """
    local("venv/bin/python manage.py runserver 0.0.0.0:8000")

