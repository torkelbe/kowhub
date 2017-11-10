from django.conf.urls import url

from views import BuilderView
from kowpdf.views import armylist_pdf

app_name= 'builder'

urlpatterns= [
    url(r'^$', BuilderView.as_view(), name='index'),
    url(r'^pdf$', armylist_pdf, name='armylist_pdf'),
]
