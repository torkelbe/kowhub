from django.conf.urls import url

from . import views

app_name= 'armybuilder'

urlpatterns= [
    url(r'^$', views.AppView.as_view(), name='armybuilder-index'),
    url(r'^dataobj/', views.dataobj, name='armybuilder-dataobj'),
    url(r'^pdfgen/', views.makepdf, name='armybuilder-pdfgen'),
    url(r'^getpdf/(?P<pdfid>[0-9]+)', views.openpdf, name='armybuilder-getpdf'),
]

# When urlpatterns finds a regex match, it calls the view function
# (ex: views.index) with a HttpRequest object as its first argument,
# and any "captured" values from the regex as other arguments.
