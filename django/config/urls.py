"""kowhub URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import RedirectView
from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage

urlpatterns = [
    #url(r'^armybuilder/', include('armybuilder.urls')),
    url(r'^builder/', include('builder.urls')),
    url(r'^pdf/', include('kowpdf.urls')),
    url(r'^$', RedirectView.as_view(url='builder')),
    url(r'^favicon.ico$',
        RedirectView.as_view(
            url=staticfiles_storage.url('img/favicon.ico')
        ),
        name="favicon"
    ),
]

if settings.ADMIN_ENABLED:
    urlpatterns += [
        url(r'^admin/', admin.site.urls),
    ]
