from django.conf.urls import url

from views import BuilderView

app_name= 'builder'

urlpatterns= [
    url(r'^$', BuilderView.as_view(), name='index'),
]
