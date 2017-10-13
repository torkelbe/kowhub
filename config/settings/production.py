from .base import *

DEBUG = False

ADMIN_ENABLED = False

COMPRESS_ENABLED = True

ALLOWED_HOSTS = ['kowhub.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '', # name of project's postgres database
        'USER': '', # name of project's postgres user
        'PASSWORD': '', # password of project's postgres user
        'HOST': 'localhost',
        'PORT': '', # may leave empty
    }
}

STATIC_ROOT = join(PROJECT_ROOT, 'static')

SECRET_KEY = ''
