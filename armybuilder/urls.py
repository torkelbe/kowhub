from django.conf.urls import url

from . import views

urlpatterns= [
    url(r'^$', views.index, name='index')
]

# When urlpatterns finds a regex match, it calls the view function
# (ex: views.index) with a HttpRequest object as its first argument,
# and any "captured" values from the regex as other arguments.
