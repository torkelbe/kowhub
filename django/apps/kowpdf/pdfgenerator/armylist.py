from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph

class Armylist:

    def __init__(self, buffer, pagesize):
        self.buffer = buffer
        if pagesize == 'A4':
            self.pagesize = A4
        elif pagesize == 'Letter':
            self.pagesize = letter
        self.width, self.height = self.pagesize

    def generate(self):
        buffer = self.buffer
        doc = SimpleDocTemplate(buffer,
                                rightMargin=72,
                                leftMargin=72,
                                topMargin=72,
                                bottomMargin=72,
                                pagesize=self.pagesize)

        elements = []

        # Need to pass style argument to 'Paragraph()'
        styles = getSampleStyleSheet()

        # Add elements that will be drawn top-to-bottom
        elements.append(Paragraph("Placeholder", styles['Heading1']))
        for i in range(10):
            elements.append(Paragraph("Unit #"+str(i), styles['Normal']))

        doc.build(elements)

        pdf = buffer.getvalue()
        buffer.close()
        return pdf
