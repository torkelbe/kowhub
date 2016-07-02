from kowhub.settings.base import *

try:
    from kowhub.settings.local import *
except ImportError, e:
    raise ImportError("Failed to import local settings")

