import os

from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.views import generic
import json

DATAFILE = "armybuilder/data/kowdata.json"

class AppView(generic.TemplateView):
    template_name = 'armybuilder/application.html'

def dataobj(request):
    if request.is_ajax():
        with open(DATAFILE, 'r') as f:
            data = f.read()
            return HttpResponse(data, content_type="application/json")
    else:
        raise Http404()

def makepdf(request):
    for value in request.GET:
        recvobj = json.loads(value)
    fileid = 0000 # Not yet implemented
    return HttpResponse('{"id":'+fileid+'}', content_type="application/json")

def openpdf(request, pdfid):
    filename = '' # Not yet implemented
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            pdf = f.read()
        os.unlink(filename);
        return HttpResponse(pdf, content_type='application/pdf')
    else:
        raise Http404("Requested file does not exist.")

