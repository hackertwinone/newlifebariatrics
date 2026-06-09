from rest_framework import serializers
from .models import Paciente, SeguroMedico, Hospitalizacion, Receta


class SeguroMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeguroMedico
        fields = '__all__'
        read_only_fields = ('fecha_registro',)


class HospitalizacionSerializer(serializers.ModelSerializer):
    motivo_display = serializers.CharField(source='get_motivo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Hospitalizacion
        fields = '__all__'
        read_only_fields = ('fecha_registro',)


class RecetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receta
        fields = '__all__'
        read_only_fields = ('fecha_registro',)


class PacienteListSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    edad = serializers.SerializerMethodField()
    sexo_display = serializers.CharField(source='get_sexo_display', read_only=True)

    class Meta:
        model = Paciente
        fields = [
            'id', 'nombre_completo', 'nombre', 'apellido_paterno', 'apellido_materno',
            'fecha_nacimiento', 'edad', 'sexo', 'sexo_display', 'telefono',
            'email', 'ciudad', 'activo', 'fecha_registro',
        ]

    def get_edad(self, obj):
        from datetime import date
        today = date.today()
        born = obj.fecha_nacimiento
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


class PacienteDetailSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()
    edad = serializers.SerializerMethodField()
    sexo_display = serializers.CharField(source='get_sexo_display', read_only=True)
    estado_civil_display = serializers.CharField(source='get_estado_civil_display', read_only=True)
    seguros = SeguroMedicoSerializer(many=True, read_only=True)
    hospitalizaciones = HospitalizacionSerializer(many=True, read_only=True)

    class Meta:
        model = Paciente
        fields = '__all__'
        read_only_fields = ('fecha_registro', 'fecha_actualizacion')

    def get_edad(self, obj):
        from datetime import date
        today = date.today()
        born = obj.fecha_nacimiento
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
