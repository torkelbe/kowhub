from django.http import HttpResponse
from io import BytesIO
from pdfgenerator.armylist import Armylist

from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def armylist_pdf(request):
    try:
        data = json.loads(request.body)
        print request.body
    except:
        print "json.loads failed"

    # Create the HttpResponse object with the appropriate PDF headers
    response = HttpResponse(content_type='application/pdf')

    # This line seems to make browser automatically download the pdf
    #response['Content-Disposition'] = 'attatchment; filename="userlist.pdf"'  
    # This line seems to open the pdf in the browser
    response['Content-Disposition'] = 'filename="userlist.pdf"'  

    # Create IO buffer to hold our drawings
    buffer = BytesIO()

    # Draw PDF using reportlab
    armylist = Armylist(buffer, 'A4')
    pdf = armylist.generate()

    response.write(pdf)
    return response
