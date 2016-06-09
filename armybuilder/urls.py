from django.conf.urls import url

from . import views

app_name= 'armybuilder'

urlpatterns= [
    url(r'^$', views.AppView.as_view(), name='armybuilder-index'),
    url(r'^armydata/', views.armydata, name='armybuilder-armydata'),
]

# When urlpatterns finds a regex match, it calls the view function
# (ex: views.index) with a HttpRequest object as its first argument,
# and any "captured" values from the regex as other arguments.
