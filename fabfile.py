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
def update_data():
    source_to_json.generate_data()

