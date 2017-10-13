from .base import *

DEBUG = False

ADMIN_ENABLED = False

COMPRESS_ENABLED = True

ALLOWED_HOSTS = ['kowhub.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': get_secret("DATABASE_NAME"),
        'USER': get_secret("DATABASE_USER"),
        'PASSWORD': get_secret("DATABASE_PASSWORD"),
        'HOST': 'localhost',
        'PORT': '',
    }
}

STATIC_ROOT = join(PROJECT_ROOT, 'static')

SECRET_KEY = get_secret("SECRET_KEY")
