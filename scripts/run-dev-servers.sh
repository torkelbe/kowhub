#!/bin/bash

# This script starts Webpack's development server for React-bundles,
# and it starts Django's normal development server.
#
# It lets us (i.e. fabfile.py) run both of these processes in one
# shell, and more importantly lets us kill both processes together.
#
# Output from both development servers are intermixed in the same
# shell, so we try to keep it clean with a few filters. This might
# hide some error messages, so if things don't work, try to run
# Webpack and Django separately instead.
#
# If this script is run with 'serve' argument, the script will run
# both Webpack and Django on '0.0.0.0'. In order to coordinate
# Webpack and Django properly, it creates a new Webpack-config file
# which it should delete when the script ends.

function webpack_dev_server {
    cd frontend && yarn run webpack-dev-server --config $1 | \
    # Print only lines starting with keyword 'webpack' or 'Built'
    grep "^webpack\|^Built" --line-buffered | \
    # Add [WEBPACK] tag to output from webpack-dev-server:
    sed -e "s/^/[WEBPACK] /"
}

function django_dev_server {
    cd django && venv/bin/python manage.py runserver $host:8000 2>&1 | \
    # Print only lines starting with certain keywords:
    #   'Starting', 'System', 'Django', or 'Quit'
    grep "Starting\|System\|Django\|Quit\|\[*\]" --line-buffered | \
    # Add [DJANGO] tag to output from Django's development server
    sed -e "s/^/[DJANGO] /"
}

function print_temp_config {
    echo "
const config = require('./webpack.local.config.js')

config.output.publicPath = 'http://$1:8080/builder/bundles/';

config.devServer = {
    host: '0.0.0.0',
    port: 8080,
};

module.exports = config
"
}

[[ $1 = "serve" ]] && serving_to_local_network=true || serving_to_local_network=false

host="localhost"
config="webpack.local.config.js"
config_dir="webpack/"
exit_cmds="kill %1;" # kill first process when second process dies

echo ""
if $serving_to_local_network; then
    # Read your IP address for the local network
    host=$(ifconfig | grep "\binet\b" | grep -Fv "127.0.0.1" | awk '{ print $2 }');

    # Set webpack config to a temporarily generated file
    config="temp.serve.config.js"

    # Create temporary config file for this particular host IP
    echo "Generating temporary Webpack config..."
    print_temp_config $host > frontend/$config_dir$config

    # Remove temporary config file when script exits
    exit_cmds+=" rm frontend/$config_dir$config;"
fi

trap "$exit_cmds" SIGINT

export PYTHONUNBUFFERED=1  # Un-buffer Django's runserver output

echo "Starting Django and Webpack development servers..."
echo "Host:   $host"
echo "Port:   8000"
echo "Config: $config"
echo ""

# serve Webpack              and serve Django
webpack_dev_server $config_dir$config & django_dev_server $host

