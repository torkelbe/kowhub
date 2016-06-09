from django.shortcuts import render

import os

from django.http import HttpResponse, Http404
from django.views import generic

DATADIR = "armybuilder/data/"

class AppView(generic.TemplateView):
    template_name = 'armybuilder/application.html'

def armydata(request):
    path = "armybuilder/data/armies.json"
    with open(path, 'r') as f:
        data = f.read()
        return HttpResponse(data, content_type="application/json")

def makepdf(request):
    # handle request.GET.get(...) to create pdf
    pdfid = '{"pdfid": "0000"}'
    return HttpResponse(pdfid, content_type="application/json")

def openpdf(request, pdfid):
    filename = DATADIR + pdfid + '.pdf'
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            pdf = f.read()
            return HttpResponse(pdf, content_type='application/pdf')
    else:
        raise Http404("Requested file does not exist.")

