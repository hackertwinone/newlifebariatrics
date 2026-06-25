from django.db import models


TIPO_SANGRE_CHOICES = [
    ('A+', 'A+'), ('A-', 'A-'),
    ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'),
    ('O+', 'O+'), ('O-', 'O-'),
]

SEXO_CHOICES = [
    ('M', 'Masculino'),
    ('F', 'Femenino'),
    ('O', 'Otro'),
]

ESTADO_CIVIL_CHOICES = [
    ('S', 'Soltero/a'),
    ('C', 'Casado/a'),
    ('D', 'Divorciado/a'),
    ('V', 'Viudo/a'),
    ('U', 'Unión libre'),
]


class Paciente(models.Model):
    nombre = models.CharField(max_length=100, verbose_name='Nombre')
    apellido_paterno = models.CharField(max_length=100, verbose_name='Apellido paterno')
    apellido_materno = models.CharField(max_length=100, blank=True, verbose_name='Apellido materno')
    fecha_nacimiento = models.DateField(verbose_name='Fecha de nacimiento')
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, verbose_name='Sexo')
    estado_civil = models.CharField(max_length=1, choices=ESTADO_CIVIL_CHOICES, verbose_name='Estado civil')
    tipo_sangre = models.CharField(max_length=3, choices=TIPO_SANGRE_CHOICES, blank=True, verbose_name='Tipo de sangre')
    curp = models.CharField(max_length=18, unique=True, blank=True, verbose_name='CURP')
    rfc = models.CharField(max_length=13, blank=True, verbose_name='RFC')
    telefono = models.CharField(max_length=20, verbose_name='Teléfono')
    telefono_emergencia = models.CharField(max_length=20, blank=True, verbose_name='Teléfono de emergencia')
    contacto_emergencia = models.CharField(max_length=200, blank=True, verbose_name='Contacto de emergencia')
    email = models.EmailField(blank=True, verbose_name='Correo electrónico')
    calle = models.CharField(max_length=200, verbose_name='Calle y número')
    colonia = models.CharField(max_length=100, blank=True, verbose_name='Colonia')
    ciudad = models.CharField(max_length=100, verbose_name='Ciudad')
    estado = models.CharField(max_length=100, verbose_name='Estado')
    codigo_postal = models.CharField(max_length=10, blank=True, verbose_name='Código postal')
    alergias = models.TextField(blank=True, verbose_name='Alergias conocidas')
    enfermedades_cronicas = models.TextField(blank=True, verbose_name='Enfermedades crónicas')
    medicamentos_actuales = models.TextField(blank=True, verbose_name='Medicamentos actuales')
    notas = models.TextField(blank=True, verbose_name='Notas adicionales')
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['apellido_paterno', 'apellido_materno', 'nombre']

    def __str__(self):
        return f'{self.apellido_paterno} {self.apellido_materno}, {self.nombre}'

    @property
    def nombre_completo(self):
        return f'{self.nombre} {self.apellido_paterno} {self.apellido_materno}'.strip()


class SeguroMedico(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='seguros')
    aseguradora = models.CharField(max_length=200, verbose_name='Aseguradora')
    numero_poliza = models.CharField(max_length=100, verbose_name='Número de póliza')
    numero_grupo = models.CharField(max_length=100, blank=True)
    nombre_titular = models.CharField(max_length=200, verbose_name='Nombre del titular')
    parentesco_titular = models.CharField(max_length=100, blank=True)
    vigencia_inicio = models.DateField()
    vigencia_fin = models.DateField(null=True, blank=True)
    telefono_aseguradora = models.CharField(max_length=20, blank=True)
    cobertura_descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Seguro médico'
        verbose_name_plural = 'Seguros médicos'

    def __str__(self):
        return f'{self.aseguradora} – Póliza {self.numero_poliza}'


class Receta(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='recetas')
    fecha = models.DateField()
    peso = models.CharField(max_length=20, blank=True, verbose_name='Peso (kg)')
    talla = models.CharField(max_length=20, blank=True, verbose_name='Talla (cm)')
    diagnostico = models.TextField(verbose_name='Diagnóstico')
    indicaciones = models.TextField(verbose_name='Indicaciones médicas')
    medico = models.CharField(max_length=200, blank=True, verbose_name='Médico')
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Receta'
        verbose_name_plural = 'Recetas'
        ordering = ['-fecha_registro']

    def __str__(self):
        return f'Receta {self.fecha} – {self.paciente}'


TABAQUISMO_CHOICES = [
    ('nunca', 'Nunca'), ('ocasional', 'Ocasional'),
    ('frecuente', 'Frecuente'), ('exfumador', 'Exfumador'),
]
ALCOHOL_CHOICES = [
    ('nunca', 'Nunca'), ('social', 'Social'), ('frecuente', 'Frecuente'),
]
ACTIVIDAD_CHOICES = [
    ('sedentario', 'Sedentario'), ('ligera', 'Ligera'),
    ('moderada', 'Moderada'), ('intensa', 'Intensa'),
]
SUENO_CHOICES = [
    ('buena', 'Buena'), ('interrumpida', 'Interrumpida'), ('mala', 'Mala'),
]
BEBIDAS_CHOICES = [
    ('nunca', 'Nunca'), ('ocasional', 'Ocasional'), ('frecuente', 'Frecuente'),
]
EMOCIONAL_CHOICES = [
    ('estable', 'Estable'), ('ansioso', 'Ansioso'),
    ('deprimido', 'Deprimido'), ('otro', 'Otro'),
]


class HistoriaClinica(models.Model):
    paciente = models.OneToOneField(
        Paciente, on_delete=models.CASCADE, related_name='historia_clinica'
    )

    # Encabezado
    fecha_realizada = models.DateTimeField(null=True, blank=True)
    doctor_que_realizo = models.CharField(max_length=200, blank=True)

    # Motivo de consulta
    motivo_consulta = models.TextField(blank=True)

    # Historia del peso
    peso_actual = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    peso_maximo_historico = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    peso_mas_bajo_adulto = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    peso_adolescencia = models.CharField(max_length=200, blank=True)
    edad_inicio_aumento_peso = models.CharField(max_length=200, blank=True)
    eventos_asociados_aumento_peso = models.JSONField(default=list, blank=True)
    intentos_previos_perder_peso = models.CharField(max_length=200, blank=True)
    especifique_intentos = models.CharField(max_length=500, blank=True)
    medicamentos_usados = models.CharField(max_length=500, blank=True)
    resultados_obtenidos = models.TextField(blank=True)

    # Composición corporal
    peso = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name='Peso medido (kg)')
    talla = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Talla (cm)')
    imc = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='IMC')
    porcentaje_grasa_corporal = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    porcentaje_grasa_visceral = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    masa_muscular = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Antecedentes
    cirugias_previas = models.TextField(blank=True)
    hospitalizaciones_previas = models.TextField(blank=True)

    # Estilo de vida
    tabaquismo = models.CharField(max_length=20, choices=TABAQUISMO_CHOICES, blank=True)
    alcohol = models.CharField(max_length=20, choices=ALCOHOL_CHOICES, blank=True)
    actividad_fisica = models.CharField(max_length=20, choices=ACTIVIDAD_CHOICES, blank=True)
    horas_sueno = models.CharField(max_length=100, blank=True)
    calidad_sueno = models.CharField(max_length=20, choices=SUENO_CHOICES, blank=True)

    # Patrón de alimentación
    numero_comidas_dia = models.PositiveSmallIntegerField(null=True, blank=True)
    desayuno_habitual = models.CharField(max_length=500, blank=True)
    comida_habitual = models.CharField(max_length=500, blank=True)
    cena_habitual = models.CharField(max_length=500, blank=True)
    snacks = models.CharField(max_length=500, blank=True)
    consumo_bebidas_azucaradas = models.CharField(max_length=20, choices=BEBIDAS_CHOICES, blank=True)
    consumo_comida_rapida = models.CharField(max_length=200, blank=True)

    # Evaluación conductual / emocional
    come_grandes_volumenes = models.BooleanField(default=False)
    come_rapido = models.BooleanField(default=False)
    come_por_ansiedad = models.BooleanField(default=False)
    come_sin_hambre = models.BooleanField(default=False)
    episodios_atracon = models.BooleanField(default=False)
    come_durante_noche = models.BooleanField(default=False)
    preferencia_alimento = models.CharField(max_length=200, blank=True)
    especifique_preferencia = models.CharField(max_length=500, blank=True)
    estado_emocional_actual = models.CharField(max_length=20, choices=EMOCIONAL_CHOICES, blank=True)
    tratamiento_psicologico_previo = models.BooleanField(default=False)
    trastornos_conducta_alimentaria_previos = models.TextField(blank=True)

    # Evaluación metabólica
    glucosa_ayuno = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    perfil_lipidico = models.TextField(blank=True)

    # Plan de tratamiento
    cirugia_bariatrica = models.BooleanField(default=False)
    procedimiento_propuesto = models.CharField(max_length=200, blank=True)
    especifique_procedimiento = models.CharField(max_length=500, blank=True)
    observaciones = models.TextField(blank=True)
    conclusiones = models.TextField(blank=True)

    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Historia clínica'
        verbose_name_plural = 'Historias clínicas'

    def __str__(self):
        return f'Historia clínica — {self.paciente}'


class Consulta(models.Model):
    paciente = models.ForeignKey(
        Paciente, on_delete=models.CASCADE, related_name='consultas'
    )
    fecha = models.DateTimeField()
    doctor = models.CharField(max_length=200, blank=True)
    peso = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, verbose_name='Peso (kg)')
    notas = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Consulta'
        verbose_name_plural = 'Consultas'
        ordering = ['-fecha']

    def __str__(self):
        return f'Consulta {self.fecha:%d/%m/%Y} — {self.paciente}'


class Hospitalizacion(models.Model):
    MOTIVO_CHOICES = [
        ('CIR', 'Cirugía programada'),
        ('URG', 'Urgencia'),
        ('OBS', 'Observación'),
        ('MAT', 'Maternidad'),
        ('DIA', 'Estudio diagnóstico'),
        ('OTR', 'Otro'),
    ]
    ESTADO_CHOICES = [
        ('ING', 'Ingresado'),
        ('INT', 'En tratamiento'),
        ('ALT', 'Alta médica'),
        ('TRA', 'Transferido'),
        ('FAL', 'Fallecido'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='hospitalizaciones')
    hospital = models.CharField(max_length=200)
    numero_expediente = models.CharField(max_length=100, blank=True)
    cama = models.CharField(max_length=20, blank=True)
    motivo = models.CharField(max_length=3, choices=MOTIVO_CHOICES)
    diagnostico_ingreso = models.TextField()
    diagnostico_egreso = models.TextField(blank=True)
    medico_responsable = models.CharField(max_length=200)
    fecha_ingreso = models.DateTimeField()
    fecha_egreso = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=3, choices=ESTADO_CHOICES, default='ING')
    procedimientos = models.TextField(blank=True)
    observaciones = models.TextField(blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Hospitalización'
        verbose_name_plural = 'Hospitalizaciones'
        ordering = ['-fecha_ingreso']

    def __str__(self):
        return f'{self.paciente} – {self.hospital}'
