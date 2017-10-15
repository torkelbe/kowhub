from .base import *

DEBUG = False

ADMIN_ENABLED = False

COMPRESS_ENABLED = True

ALLOWED_HOSTS = ['kowhub.com']

WEBPACK_LOADER = {
    'builder': {
        'BUNDLE_DIR_NAME': 'builder/bundles/',
        'STATS_FILE': join(PROJECT_ROOT, 'reactapp/webpack-stats.production.json'),
    }
}

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

STATICFILES_DIRS += [ join(PROJECT_ROOT, 'reactapp/bundles-prod') ]
STATIC_ROOT = join(PROJECT_ROOT, 'static')

SECRET_KEY = get_secret("SECRET_KEY")
