# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
ADMIN_ENABLED = True

COMPRESS_ENABLED = False

ALLOWED_HOSTS = []

# Database
# https://docs.djangoproject.com/en/1.9/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': '/absolute/path/to/db.sqlite3'),
        'USER': '',         # not used with sqlite
        'PASSWORD': '',     # not used with sqlite
        'HOST': '',         # not used with sqlite
        'PORT': '',         # not used with sqlite
    }
}

STATIC_ROOT = ""

# SECURITY WARNING: keep the secret key used in production secret!
# CHANGE THIS! THIS IS PUBLIC AS IT'S IN SOURCE CONTROL
SECRET_KEY = '6n7d_c302kd^&gty^zfeh#tkz5_yma6(z(h8uh@sz3!va^*$p('
