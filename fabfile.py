import os
from fabric.api import *
from fabric.contrib.console import confirm
from kowsourcedata import numbers_to_csv, csv_to_json, json_to_js
from kowsourcedata.utilities import data_location

class RemoteSite(object):

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        self.json_data_file = data_location.json

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
            put(self.json_data_file, 'kowhub/armybuilder/data/')

    def update_packages(self):
        self.run("venv/bin/pip install -r kowhub/requirements.txt")

    def django_manage(self, cmd):
        self.run('venv/bin/python kowhub/manage.py ' + cmd)

    def restart(self):
        self.run('sudo supervisorctl restart kowhub')


class LocalEnvironment(object):

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        self.settings = 'config.settings.local'

    def manage(self, cmd):
        local('venv/bin/django-admin ' + cmd +
              ' --settings=' + self.settings +
              ' --pythonpath=' + self.dir)

    def webpack_compile(self, production=False):
        webpack_dir = os.path.join(self.dir, 'reactapp')
        if production:
            local('cd '+webpack_dir+' && yarn run build-production')
        else:
            local('cd '+webpack_dir+' && yarn run build-development')

    def webpack_dev_server(self):
        webpack_dir = os.path.join(self.dir, 'reactapp')
        local('cd '+webpack_dir+' && yarn run dev-server')


env.use_ssh_config=True
env.hosts = ['kowhub-webserver']
PROD = RemoteSite(
    dir='/webapps/kowhub_django',
)

DEV = LocalEnvironment(
    dir=os.path.dirname(os.path.abspath(__file__))
)

@task
def help():
    """ Simple help print """
    print ""
    print "Run a task with arguments using '$ fab task:argument'"
    print "Suppress Fabric output with '--hide=running,status'"
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
    """ Manage source data. Option: (csv|json|js|make|dry|error|upload)
    - 'csv'   to export from numbers to csv
    - 'json'  to convert from csv to json
    - 'js'    to export from json to importable js library
    - 'make'  to perform all data procedures, starting from source spreadsheets
    - 'dry'   to do a test run of csv-to-json, and pretty-print result to console only
    - 'error' to check for errors in csv-to-json file parsing
    """
    if arg.startswith("csv"):
        numbers_to_csv.export()
    elif arg.startswith("json"):
        csv_to_json.export(write_to_file=True, write_to_console=False)
    elif arg.startswith("js"):
        json_to_js.export()
    elif arg.startswith("make"):
        numbers_to_csv.export()
        csv_to_json.export(write_to_file=True, write_to_console=False)
        json_to_js.export()
    elif arg.startswith("update"):
        csv_to_json.export(write_to_file=True, write_to_console=False)
    elif arg.startswith("dry"):
        csv_to_json.export(write_to_file=False, write_to_console=True)
    elif arg.startswith("error"):
        csv_to_json.export(write_to_file=False, write_to_console=False)
    elif arg == "upload":
        print "New data file will be uploaded to kowhub.com"
        if confirm("Do you wish to continue?"):
            PROD.upload_data_file()
    else:
        print "Requires argument (csv|json|js|make|dry|error|upload)"

@task
def run(arg=""):
    """ Run both Webpack and Django development servers. Option: (serve)
    Using argument (serve) will run both dev servers on 0.0.0.0
    """
    if arg.startswith("serve"):
        local("bash scripts/run-dev-servers.sh serve")
    else:
        local("bash scripts/run-dev-servers.sh")

@task
def rundjango(arg=""):
    """ Run Django development server. Option: (serve)
    Using option (serve) will run dev server on 0.0.0.0
    """
    if arg.startswith("serve"):
        DEV.manage('runserver 0.0.0.0:8000')
    else:
        DEV.manage('runserver')

@task
def manage(arg=""):
    """ python manage.py <cmd> """
    if not arg: help()
    else: DEV.manage(arg)

@task
def bundle(arg=""):
    """ Compile bundle with Webpack. Option: (production)
    Using argument (prod) will compile with production settings.
    """
    if arg.startswith("prod"):
        if confirm("Do you wish to create a new version-controlled production bundle?"):
            DEV.webpack_compile(production=True)
    elif arg.startswith("dev") or not arg:
        DEV.webpack_compile()
    else:
        print "Invalid argument "+arg

@task
def runwebpack():
    """ Run Webpack development server on localhost:8080 """
    DEV.webpack_dev_server()

