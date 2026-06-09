from datetime import date

from django.http import HttpResponse
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Paciente, SeguroMedico, Hospitalizacion, Receta
from .serializers import (
    PacienteListSerializer, PacienteDetailSerializer,
    SeguroMedicoSerializer, HospitalizacionSerializer, RecetaSerializer
)
from .receta_pdf import generar_receta


class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'apellido_paterno', 'apellido_materno', 'curp', 'telefono', 'email']
    ordering_fields = ['apellido_paterno', 'fecha_registro', 'fecha_nacimiento']
    ordering = ['apellido_paterno']

    def get_serializer_class(self):
        if self.action == 'list':
            return PacienteListSerializer
        return PacienteDetailSerializer

    @action(detail=True, methods=['get'])
    def seguros(self, request, pk=None):
        paciente = self.get_object()
        seguros = paciente.seguros.all()
        serializer = SeguroMedicoSerializer(seguros, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def hospitalizaciones(self, request, pk=None):
        paciente = self.get_object()
        hospitalizaciones = paciente.hospitalizaciones.all()
        serializer = HospitalizacionSerializer(hospitalizaciones, many=True)
        return Response(serializer.data)


class SeguroMedicoViewSet(viewsets.ModelViewSet):
    queryset = SeguroMedico.objects.all()
    serializer_class = SeguroMedicoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['paciente', 'activo']


class HospitalizacionViewSet(viewsets.ModelViewSet):
    queryset = Hospitalizacion.objects.all()
    serializer_class = HospitalizacionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['paciente', 'estado', 'motivo']
    ordering = ['-fecha_ingreso']


class RecetaViewSet(viewsets.ModelViewSet):
    queryset = Receta.objects.all()
    serializer_class = RecetaSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['paciente']
    ordering = ['-fecha_registro']

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        receta = self.get_object()
        paciente = receta.paciente

        hoy = date.today()
        born = paciente.fecha_nacimiento
        edad = hoy.year - born.year - ((hoy.month, hoy.day) < (born.month, born.day))

        fecha_str = receta.fecha.strftime('%d/%m/%Y')

        pdf_buffer = generar_receta(
            nombre_completo=paciente.nombre_completo,
            edad=edad,
            fecha=fecha_str,
            diagnostico=receta.diagnostico,
            peso=receta.peso,
            talla=receta.talla,
            indicaciones=receta.indicaciones,
        )

        nombre_archivo = f"receta_{paciente.apellido_paterno}_{paciente.nombre}_{receta.fecha}.pdf"
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{nombre_archivo}"'
        return response
