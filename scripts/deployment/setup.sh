#!/bin/bash

#### DJANGO PRODUCTION SETUP
#
# This script produces suggested configuration files for
# Gunicorn, Supervisor, and Nginx for use in production
#

echo "Running 'scripts/deployment/setup.sh'"

# Find the location of this file
THIS_FILE=$(grep --include=setup.sh -rnwl "$(pwd)" -e 'let-django-prod-setup-find-me')
if [[ -z $THIS_FILE ]]; then
    echo "Please enter project directory"
    exit
fi
cd $(dirname $(dirname $(dirname $THIS_FILE))) # project root dir
TEMPLATES=$(dirname $THIS_FILE)/templates
CONFIGS=$(pwd)

#=========== MAIN SETTINGS ==============
#
PROJNAME="kowhub"
PROJDIR=${PWD}
DJANGODIR=${PROJDIR}/django
PROJUSER=kowhub
USERGROUP=$(groups ${PROJUSER} | cut -d ' ' -f 3)
HOSTNAME=kowhub.com
#
#========================================

#### Create various production directories
STATIC_ROOT=${PROJDIR}/static
MEDIA_ROOT=${PROJDIR}/media
LOGSDIR=${PROJDIR}/logs
[[ -e $STATIC_ROOT ]] || mkdir $STATIC_ROOT
[[ -e $MEDIA_ROOT ]] || mkdir $MEDIA_ROOT
[[ -e $LOGSDIR ]] || mkdir $LOGSDIR
touch ${LOGSDIR}/gunicorn_supervisor.log

#### Create gunicorn_start
echo "Generating gunicorn_start..."
sed -e "
s~\?PROJNAME?~'${PROJNAME}'~g;
s~\?PROJDIR?~'${PROJDIR}'~g;
s~\?PROJUSER?~'${PROJUSER}'~g;
s~\?USERGROUP?~'${USERGROUP}'~g;
s~\?DJANGODIR?~'${DJANGODIR}'~g;
" < $TEMPLATES/gunicorn.config > $CONFIGS/gunicorn_start
chmod u+x $CONFIGS/gunicorn_start

#### Create nginx.config
echo "Generating nginx.config..."
sed -e "
s~\?PROJNAME?~${PROJNAME}~g;
s~\?PROJDIR?~${PROJDIR}~g;
s~\?HOSTNAME?~${HOSTNAME}~g;
" < $TEMPLATES/nginx.config > $CONFIGS/nginx.config

#### Create supervisor.config
echo "Generating supervisor.config..."
sed -e "
s~\?PROJNAME?~${PROJNAME}~g;
s~\?PROJDIR?~${PROJDIR}~g;
s~\?DJANGODIR?~${DJANGODIR}~g;
s~\?PROJUSER?~${PROJUSER}~g;
" < $TEMPLATES/supervisor.config > $CONFIGS/supervisor.config

#### List general settings
echo "
Created configuration files with the following settings:
    PROJNAME  = ${PROJNAME}
    PROJDIR   = ${PROJDIR}
    DJANGODIR = ${DJANGODIR}

    PROJUSER  = ${PROJUSER}
    USERGROUP = ${USERGROUP}

    HOSTNAME  = ${HOSTNAME}

Make sure to double check the configurations.
The files should be moved to the following locations:
    ${DJANGODIR}/venv/bin/gunicorn_start
    /etc/supervisor/conf.d/kowhub.conf
    /etc/nginx/sites-available/kowhub
    /etc/nginx/sites-enabled/kowhub     (copy)
"

