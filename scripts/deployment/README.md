## Configure Kowhub for Production

This is a guide for deploying Kowhub to a production server.

## Installation

It is assumed that you are logged in on a Debian-based Linux server with sudo privileges.

### Install dependencies

```text
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install acl                                        # file permissions manager
sudo apt-get install python-dev python-virtualenv               # python packages
sudo apt-get install libpq-dev postgresql postgresql-contrib    # database
sudo apt-get install nginx ufw supervisor                       # webserver packages
```

### Create user, usergroup, and directory

```text
sudo groupadd --system webapps
sudo useradd --system --gid webapps --shell /bin/bash --home /webapps/kowhub kowhub
sudo mkdir -p /webapps/kowhub
sudo chown kowhub /webapps/kowhub
```

### Create database and database user

Set up the database by following the example commands.

```text
sudo su - postgres

# CREATE USER kowhub WITH PASSWORD 'my-password';
# ALTER USER kowhub SET client_encoding TO 'utf8';
# ALTER USER kowhub SET default_transaction_isolation TO 'read committed';
# ALTER USER kowhub SET timezone TO 'CET';
# CREATE DATABASE kowhubdb OWNER kowhub;
```

### Log in as user and clone project into its home directory

```text
sudo su - kowhub
git clone https://github.com/torkelbe/kowhub.git .
```

### Run make

```text
make production
```

This will also create suggested configuration files for Gunicorn, supervisor, and Nginx.

```text
gunicorn_start
supervisor.config
nginx.config
```

### Configure Django

All environment-specific settings are sourced from a JSON secrets-file. Edit this file with a new Secret Key for Django, as well as with the database information used earlier.

```text
vim django/config/settings/secrets.json
```

Now that Django has access to the database, run _migrate_ using `make` to ensure that we source the correct Django settings.

```text
make prod-migrate
```

### Configure Gunicorn

Gunicorn runs Django using the script `gunicorn_start`. Double-check its configuration, then move it.
(Note: if the gunicorn script is kept in a different location, this must be reflected in supervisor.config)

```text
cp gunicorn_start django/venv/bin/
```

### Configure Supervisor

Use supervisor to start/stop Gunicorn and Django.

The remaining parts of deployment will require sudo, so `exit` out of the webapp-user (who lacks privileges).

We will change ownership and permissions of supervisor to allow our webapps users to restart their supervisor processes (after a new version to the production server, for example). In this case, any user that belongs to the 'webapps' group will not need to use sudo to manage supervisor.

```text
sudo vim /etc/supervisor/supervisord.conf
```

Change the `[unix_http_server]` section to allow group read/write access with `chmod=0770`, and set ownership to `nobody:webapps` (or whatever makes sense for your configuration).

```text
[unix_http_server]
file=/var/run/supervisor.sock
chmod=0770
chown=nobody:webapps
```

Also make sure that the `[supervisorctl]` section is configured to use unix socket (and not TCP socket).

```text
[supervisorctl]
serverurl=unix:///var/run/supervisor.sock
```

Restart _supervisor_ to apply the changes.

```text
sudo service supervisor stop
sudo service supervisor start
```

Double-check supervisor.config settings for the webapp, move the file, and start the service. (If your currently active sudo-user is also a member of the _webapps_ group, you should be able to call `supervisorctl` without using sudo here.)

```text
sudo mv (webapp-dir)/supervisor.config /etc/supervisor/conf.d/kowhub.conf

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart kowhub
```

### Configure Nginx

Set up Nginx in front of Gunicorn.

Double-check nginx.config before moving the file and starting the service.

```text
sudo service nginx start
sudo mv (webapp-dir)/nginx.config /etc/nginx/sites-available/kowhub
sudo ln -s /etc/nginx/sites-available/kowhub /etc/nginx/sites-enabled/kowhub
sudo service nginx restart
```

### Configure UFW firewall

Use the following commands for configuring UFW firewall. Make sure to allow SSH and HTTP.

```text
sudo ufw status
sudo ufw allow ssh
sudo ufw allow http
sudo ufw start|restart
```

Hurra! The webserver should now be up and running.

## Web application management

Manage Django/Gunicorn with Supervisor using

```text
supervisorctl (status|start|stop|restart) kowhub
```

Manage Nginx using

```text
sudo service nginx (status|start|stop|restart)
```

When updating server, make sure to perform the following tasks. Make sure to source the correct django settings. You can use _Fabric_ remotely or _make_ locally.

```text
manage.py migrate                   |  make prod-migrate
manage.py collectstatic             |  make prod-collectstatic
supervisorctl restart kowhub
```

## Uninstall

Stop the web application with

```text
sudo supervisorctl stop kowhub
```

Three files belonging to the project will exist outside of the project directory.
You may delete these

```text
/etc/supervisor/conf.d/kowhub.conf
/etc/nginx/sites-available/kowhub
/etc/nginx/sites-enabled/kowhub
```

Finally, restart Nginx

```text
sudo service nginx restart
```