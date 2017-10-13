from .base import *

DEBUG = True

ADMIN_ENABLED = True

COMPRESS_ENABLED = False

ALLOWED_HOSTS = []

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': join(PROJECT_ROOT, 'db.sqlite3'),
        'USER': '',         # not used with sqlite
        'PASSWORD': '',     # not used with sqlite
        'HOST': '',         # not used with sqlite
        'PORT': '',         # not used with sqlite
    }
}

STATIC_ROOT = ""

SECRET_KEY = '6n7d_c302kd^&gty^zfeh#tkz5_yma6(z(h8uh@sz3!va^*$p('
