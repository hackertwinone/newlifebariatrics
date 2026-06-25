from rest_framework import serializers
from .models import Paciente, SeguroMedico, Hospitalizacion, Receta, HistoriaClinica, Consulta


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


class HistoriaClinicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriaClinica
        fields = '__all__'
        read_only_fields = ('paciente', 'fecha_registro', 'fecha_actualizacion')

    def _calc_imc(self, peso, talla):
        try:
            talla_m = float(talla) / 100
            return round(float(peso) / (talla_m ** 2), 2)
        except (TypeError, ZeroDivisionError):
            return None

    def validate(self, data):
        # Auto-calculate IMC from peso/talla when not explicitly set
        peso = data.get('peso') or (self.instance.peso if self.instance else None)
        talla = data.get('talla') or (self.instance.talla if self.instance else None)
        if 'imc' not in data and peso and talla:
            data['imc'] = self._calc_imc(peso, talla)
        return data


class ConsultaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consulta
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


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
