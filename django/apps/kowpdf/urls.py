from django.conf.urls import url

from views import armylist_pdf

app_name = 'kowpdf'

urlpatterns = [
    url(r'^$', armylist_pdf, name='armylist_pdf'),
]

