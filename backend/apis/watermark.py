import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import gray
from PyPDF2 import PdfReader, PdfWriter
from django.conf import settings

# Set absolute font path
FONT_PATH = os.path.join(settings.BASE_DIR, "apis", "fonts", "Outfit.ttf")
if os.path.exists(FONT_PATH):
    pdfmetrics.registerFont(TTFont("Outfit", FONT_PATH))
else:
    raise FileNotFoundError(f"Font file not found at: {FONT_PATH}")

def create_watermark_pdf(watermark_path, text):
    c = canvas.Canvas(watermark_path, pagesize=letter)
    c.saveState()

    c.setFont("Outfit", 80)
    c.setFillColor(gray)
    c.setFillAlpha(0.2)

    width, height = letter
    c.translate(width / 2, height / 2)
    c.rotate(45)
    c.drawCentredString(0, 0, text)

    c.restoreState()
    c.save()

def watermark_pdf(input_path, watermark_text, project_id):
    proposals_dir = os.path.join(settings.MEDIA_ROOT, "proposals")
    watermarked_dir = os.path.join(proposals_dir, "watermarked")
    os.makedirs(watermarked_dir, exist_ok=True)

    watermark_path = os.path.join(proposals_dir, f"watermark_{project_id}.pdf")
    create_watermark_pdf(watermark_path, watermark_text)

    output_path = os.path.join(watermarked_dir, f"watermarked_{project_id}.pdf")

    watermark_reader = PdfReader(watermark_path)
    watermark_page = watermark_reader.pages[0]

    reader = PdfReader(input_path)
    writer = PdfWriter()

    for i, page in enumerate(reader.pages):
        try:
            page.merge_page(watermark_page)
        except Exception as e:
            print(f"Failed to watermark page {i}: {e}")
        writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path
