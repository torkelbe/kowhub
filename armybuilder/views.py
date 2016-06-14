import os

from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.views import generic
import json

from kowpdfs import latexpdf

DATAFILE = "armybuilder/data/armies.json"
PDFSDIR = "armybuilder/kowpdfs/temp/"

class AppView(generic.TemplateView):
    template_name = 'armybuilder/application.html'

def armydata(request):
    if request.is_ajax():
        with open(DATAFILE, 'r') as f:
            data = f.read()
            return HttpResponse(data, content_type="application/json")
    else:
        raise Http404()

def makepdf(request):
    for value in request.GET:
        recvobj = json.loads(value)
    fileid = latexpdf.make_latex_pdf(recvobj, DATAFILE)
    return HttpResponse('{"id":'+fileid+'}', content_type="application/json")

def openpdf(request, pdfid):
    filename = PDFSDIR + pdfid + '.pdf'
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            pdf = f.read()
        os.unlink(filename);
        return HttpResponse(pdf, content_type='application/pdf')
    else:
        raise Http404("Requested file does not exist.")

