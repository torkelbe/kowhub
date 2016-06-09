from django.shortcuts import render
# Create your views here.

import os

from django.http import HttpResponse, Http404
from django.views import generic

class AppView(generic.TemplateView):
    template_name = 'armybuilder/application.html'

def armydata(request):
    path = "armybuilder/data/armies.json"
    with open(path, 'r') as f:
        data = f.read()
        return HttpResponse(data, content_type="application/json")
