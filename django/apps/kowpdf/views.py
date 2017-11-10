from django.http import HttpResponse
from reportlab.pdfgen import canvas
from io import BytesIO

def default(request):
    # Create the HttpResponse object with the appropriate PDF headers
    response = HttpResponse(content_type='application/pdf')
    # This line seems to make browser automatically download the pdf
    #response['Content-Disposition'] = 'attatchment; filename="userlist.pdf"'  
    # This line seems to open the pdf in the browser
    response['Content-Disposition'] = 'filename="userlist.pdf"'  

    # Create IO buffer to hold our drawings
    buffer = BytesIO()
    
    # Create the PDF object, using the response object as its "file"
    p = canvas.Canvas(buffer)
    
    # Draw things on the PDF. Here is where the PDF generation happens
    p.drawString(100, 700, "Placeholder")

    # Close the PDF object cleanly
    p.showPage()
    p.save()

    # Transfer buffer value to response object
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)

    return response
