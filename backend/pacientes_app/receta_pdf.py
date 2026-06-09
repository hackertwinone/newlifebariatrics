from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject

TEMPLATE_PATH = (
    Path(__file__).resolve().parent.parent
    / 'static' / 'plantillas' / 'receta_editable_dr_jose_antonio.pdf'
)

# Exact field names discovered from the PDF AcroForm annotations
CAMPOS = {
    'nombre':      'Campo de texto 59',
    'fecha':       'Campo de texto 66',
    'edad':        'Campo de texto 67',
    'diagnostico': 'Campo de texto 65',
    'peso':        'Campo de texto 68',
    'talla':       'Campo de texto 69',
    'indicaciones': 'Campo de texto 37',
}


def generar_receta(nombre_completo, edad, fecha, diagnostico, peso, talla, indicaciones):
    reader = PdfReader(TEMPLATE_PATH)
    writer = PdfWriter()
    writer.append(reader)

    valores = {
        CAMPOS['nombre']:       nombre_completo,
        CAMPOS['fecha']:        fecha,
        CAMPOS['edad']:         f'{edad} años',
        CAMPOS['diagnostico']:  diagnostico,
        CAMPOS['peso']:         f'{peso} kg' if peso else '',
        CAMPOS['talla']:        f'{talla} cm' if talla else '',
        CAMPOS['indicaciones']: indicaciones,
    }

    writer.update_page_form_field_values(writer.pages[0], valores)

    # Tell PDF viewers to regenerate field appearances
    if '/AcroForm' in writer._root_object:
        writer._root_object['/AcroForm'].update({'/NeedAppearances': BooleanObject(True)})

    output = BytesIO()
    writer.write(output)
    output.seek(0)
    return output
