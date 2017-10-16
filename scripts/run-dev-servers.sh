#!/bin/bash

# This script starts Webpack's development server for React-bundles,
# and it starts Django's normal development server.
#
# It lets us (i.e. fabfile.py) run both of these processes in one
# shell, and more importantly lets us kill both processes together.
#
# Output from both development servers are intermixed in the same
# shell, so we try to keep it clean with a few filters.

export PYTHONUNBUFFERED=1  # Un-buffers Django's runserver output

trap 'kill %1' SIGINT   # Kill first process when second process dies

echo ""
echo "Starting Django and Webpack development servers..."
echo ""

cd reactapp && yarn run dev-server | \
    # Print only lines starting with keyword 'webpack'
    grep "^webpack" --line-buffered | \
    # Add [WEBPACK] tag to output from webpack-dev-server:
    sed -e "s/^/[WEBPACK] /" & \

venv/bin/python manage.py runserver localhost:8000 2>&1 | \
    # Print only lines starting with keywords:
    #   'Starting', 'System', 'Django', or 'Quit'
    grep "Starting\|System\|Django\|Quit\|\[*\]" --line-buffered | \
    # Add [DJANGO] tag to output from Django's development server
    sed -e "s/^/[DJANGO] /"
