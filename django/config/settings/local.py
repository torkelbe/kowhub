from .base import *

DEBUG = True

ADMIN_ENABLED = True

COMPRESS_ENABLED = False

ALLOWED_HOSTS = []

WEBPACK_LOADER = {
    'builder': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'builder/bundles/',
        'STATS_FILE': join(FRONTEND_ROOT, 'webpack/webpack-stats.local.json'),
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': join(DJANGO_ROOT, 'db.sqlite3'),
        'USER': '',         # not used with sqlite
        'PASSWORD': '',     # not used with sqlite
        'HOST': '',         # not used with sqlite
        'PORT': '',         # not used with sqlite
    }
}

STATICFILES_DIRS += [ join(FRONTEND_ROOT, 'bundles-dev') ]
STATIC_ROOT = ""

SECRET_KEY = get_secret("SECRET_KEY")
