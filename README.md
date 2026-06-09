# Sistema de Expedientes Clínicos

Aplicación Django + React para gestión de expedientes de pacientes.

## Estructura

```
clinica_app/
├── backend/      → API Django REST Framework
└── frontend/     → Interfaz React + Vite
```

## Instalación del backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API disponible en: http://localhost:8000/api/
Admin en: http://localhost:8000/admin/

## Instalación del frontend

```bash
cd frontend
npm install
npm run dev
```

Interfaz disponible en: http://localhost:5173/

## Funcionalidades

- **Pacientes**: registro completo (datos personales, contacto, dirección, información médica)
- **Seguros médicos**: asociados por paciente, con vigencia y cobertura
- **Hospitalizaciones**: historial de ingresos con diagnóstico, médico, fechas y estado
- Búsqueda por nombre, apellido, CURP o teléfono
- Formularios con validación en español
- Panel de administración Django incluido
