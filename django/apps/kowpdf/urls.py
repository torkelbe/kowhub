from django.conf.urls import url

from views import default

app_name = 'kowpdf'

urlpatterns = [
    url(r'^$', default, name='default'),
]

