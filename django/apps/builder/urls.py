from django.conf.urls import url

from views import BuilderView
from kowpdf.views import default

app_name= 'builder'

urlpatterns= [
    url(r'^$', BuilderView.as_view(), name='index'),
    url(r'^pdf$', default, name='default'),
]
