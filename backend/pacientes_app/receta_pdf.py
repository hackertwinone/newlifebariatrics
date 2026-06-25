from io import BytesIO
from pathlib import Path

from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

LOGO_PATH = Path(__file__).resolve().parent.parent / 'static' / 'newlife_bariatrics_logo.png'

# Purple palette
PURPLE      = (109/255,  87/255, 151/255)   # #6D5797
PURPLE_DARK = ( 80/255,  61/255, 126/255)   # #503D7E
GRAY        = ( 60/255,  60/255,  60/255)   # near-black for body text

# Half-letter landscape: 8.5" × 5.5"
W, H = 612, 396
ML   = 25       # left margin
MR   = 25       # right margin
MT   = 14       # top margin
MB   = 14       # bottom margin
UW   = W - ML - MR   # usable width = 562


def _double_rule(c, y):
    """Two close purple horizontal lines, matching the template's double rule."""
    c.setStrokeColorRGB(*PURPLE)
    c.setLineWidth(1.8)
    c.line(ML, y, W - MR, y)
    c.setLineWidth(0.9)
    c.line(ML, y - 3.5, W - MR, y - 3.5)


def generar_receta(nombre_completo, edad, fecha, indicaciones):
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=(W, H))

    # ── HEADER ────────────────────────────────────────────────────────────────
    header_top = H - MT   # 598

    # Logo — compact for landscape
    logo_w = 75
    logo_h = 75
    logo_y = header_top - logo_h
    if LOGO_PATH.exists():
        c.drawImage(
            str(LOGO_PATH),
            ML, logo_y,
            width=logo_w, height=logo_h,
            preserveAspectRatio=True,
            mask='auto',
        )

    # Clinic info — right-aligned
    right_x = W - MR
    info_y = header_top

    clinic_lines = [
        ('Cirugía Bariátrica y Metabólica',                                    13, 'bold',   PURPLE),
        ('Manejo Integral de la Obesidad',                                      9, 'bold',   PURPLE),
        ('Universidad Autónoma de Nuevo León',                                  8, 'bold',   PURPLE),
        ('Dra. Aurora Natalia Ponce Escobedo',                                  8, 'normal', PURPLE),
        ('Cedula Profesional: 8979204',                                          7, 'normal', PURPLE),
        ('Cedula Especialista: 12165885',                                        7, 'normal', PURPLE),
        ('Certificación Cirugía Bariátrica y Metabólica: CB21005321',           6, 'normal', PURPLE),
    ]

    for text, size, weight, color in clinic_lines:
        font = 'Helvetica-Bold' if weight == 'bold' else 'Helvetica'
        info_y -= (size + 3)
        c.setFont(font, size)
        c.setFillColorRGB(*color)
        c.drawRightString(right_x, info_y, text)

    # Double rule — below whichever column is taller
    rule1_y = min(logo_y - 5, info_y - 6)
    _double_rule(c, rule1_y)

    # ── PATIENT INFO ROW ──────────────────────────────────────────────────────
    pat_y = rule1_y - 14

    # "Nombre de Paciente:" label in purple
    label_nombre = 'Nombre de Paciente:'
    c.setFont('Helvetica-Bold', 8)
    c.setFillColorRGB(*PURPLE)
    c.drawString(ML + 8, pat_y, label_nombre)
    label_w = c.stringWidth(label_nombre, 'Helvetica-Bold', 8)

    # Patient name value in dark
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(*GRAY)
    c.drawString(ML + 8 + label_w + 4, pat_y, nombre_completo)

    # "Edad:" label in purple (right side)
    edad_label = 'Edad:'
    edad_val = f'{edad} años'
    edad_x = W - MR - 85
    c.setFont('Helvetica-Bold', 8)
    c.setFillColorRGB(*PURPLE)
    c.drawString(edad_x, pat_y, edad_label)
    edad_label_w = c.stringWidth(edad_label, 'Helvetica-Bold', 8)
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(*GRAY)
    c.drawString(edad_x + edad_label_w + 4, pat_y, edad_val)

    # Underline across the full patient row
    c.setStrokeColorRGB(*PURPLE)
    c.setLineWidth(0.5)
    c.line(ML, pat_y - 5, W - MR, pat_y - 5)

    # Double rule below patient info
    rule2_y = pat_y - 8
    _double_rule(c, rule2_y)

    # ── RX AREA ───────────────────────────────────────────────────────────────
    rx_y = rule2_y - 18
    c.setFont('Times-Italic', 20)
    c.setFillColorRGB(*PURPLE)
    c.drawString(ML + 20, rx_y, 'Rx:')

    # Footer baseline
    rule3_y = MB + 48

    # Indicaciones text
    text_y = rx_y - 16
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(*GRAY)

    lines = simpleSplit(indicaciones or '', 'Helvetica', 8, UW - 24)
    for line in lines:
        if text_y < rule3_y + 12:
            break
        c.drawString(ML + 20, text_y, line)
        text_y -= 12

    # ── FOOTER ────────────────────────────────────────────────────────────────
    _double_rule(c, rule3_y)

    foot_y = rule3_y - 13

    # "Fecha:" label in purple
    fecha_label = 'Fecha:'
    c.setFont('Helvetica-Bold', 8)
    c.setFillColorRGB(*PURPLE)
    c.drawString(ML + 8, foot_y, fecha_label)
    fecha_label_w = c.stringWidth(fecha_label, 'Helvetica-Bold', 8)
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(*GRAY)
    c.drawString(ML + 8 + fecha_label_w + 4, foot_y, fecha)

    # Underline for fecha
    fecha_val_w = c.stringWidth(fecha, 'Helvetica', 8)
    c.setStrokeColorRGB(*PURPLE)
    c.setLineWidth(0.5)
    fecha_line_end = ML + 8 + fecha_label_w + 4 + fecha_val_w + 50
    c.line(ML + 8 + fecha_label_w + 4 + fecha_val_w + 3, foot_y - 3,
           fecha_line_end, foot_y - 3)

    # "Firma:" label in purple (right side)
    firma_x = W - MR - 120
    firma_label = 'Firma:'
    c.setFont('Helvetica-Bold', 8)
    c.setFillColorRGB(*PURPLE)
    c.drawString(firma_x, foot_y, firma_label)
    firma_label_w = c.stringWidth(firma_label, 'Helvetica-Bold', 8)
    c.setStrokeColorRGB(*PURPLE)
    c.setLineWidth(0.5)
    c.line(firma_x + firma_label_w + 4, foot_y - 3, W - MR, foot_y - 3)

    # Address lines — centered, dark gray
    addr1 = 'Plaza Mirage Local 11, Av. Gonzalitos # 460 Sur, Col. San Jerónimo CP 64069, Monterrey,N.L'
    addr2 = 'Citas:  81 8683 7171  contacto: newlife.cirugiabariatrica@gmail.com'
    c.setFont('Helvetica', 6)
    c.setFillColorRGB(*GRAY)
    c.drawCentredString(W / 2, foot_y - 12, addr1)
    c.drawCentredString(W / 2, foot_y - 20, addr2)

    c.save()
    buf.seek(0)
    return buf
