import os
import subprocess
from fabric.api import *
from armybuilder.kowdatagen import source_to_json

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
def deploy():
    print "Deploying on " +  " ".join(env.hosts)
    PROD.deploy()

@task
def data(arg=""):
    if arg.startswith("update"):
        source_to_json.generate_data(error_print=False, write_to_file=True, write_to_console=False)
    elif arg.startswith("dry"):
        source_to_json.generate_data(error_print=False, write_to_file=False, write_to_console=True)
    elif arg.startswith("error"):
        source_to_json.generate_data(error_print=True, write_to_file=False, write_to_console=False)
    else:
        print "Requires argument (update|dry|error)"

@task
def database(cmd="status"):
    data_file = "/Users/torkel/Library/Application Support/Postgres/var-9.5"
    FNULL = open(os.devnull,'w')
    if cmd=="start":
        retcode = subprocess.call(["pg_ctl","start","-D",data_file], stdout=FNULL)
        if retcode==0: print "Started postgres database"
        else: print "Error when starting postgres database!"
    elif cmd=="stop":
        retcode = subprocess.call(["pg_ctl","stop","-D",data_file], stdout=FNULL)
        if retcode==0: print "Stopped postgres database"
        else: print "Error when stopping postgres database!"
    elif cmd=="status":
        retcode = subprocess.call(["pg_ctl","status","-D",data_file])
    else:
        retcode = 1
        print "Option \""+cmd+"\" not recognized."
    return retcode

@task
def runserver():
    if database(cmd="status"): database(cmd="start")
    local("kowhubenv/bin/python manage.py runserver")

