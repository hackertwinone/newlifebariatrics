from django.contrib import admin
from .models import Paciente, SeguroMedico, Hospitalizacion


class SeguroInline(admin.TabularInline):
    model = SeguroMedico
    extra = 0


class HospitalizacionInline(admin.TabularInline):
    model = Hospitalizacion
    extra = 0


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ['apellido_paterno', 'apellido_materno', 'nombre', 'fecha_nacimiento', 'telefono', 'activo']
    search_fields = ['nombre', 'apellido_paterno', 'curp']
    list_filter = ['activo', 'sexo', 'ciudad']
    inlines = [SeguroInline, HospitalizacionInline]


@admin.register(SeguroMedico)
class SeguroMedicoAdmin(admin.ModelAdmin):
    list_display = ['paciente', 'aseguradora', 'numero_poliza', 'activo']


@admin.register(Hospitalizacion)
class HospitalizacionAdmin(admin.ModelAdmin):
    list_display = ['paciente', 'hospital', 'motivo', 'estado', 'fecha_ingreso']
