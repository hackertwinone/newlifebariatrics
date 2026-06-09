from rest_framework.routers import DefaultRouter
from .views import PacienteViewSet, SeguroMedicoViewSet, HospitalizacionViewSet, RecetaViewSet

router = DefaultRouter()
router.register(r'pacientes', PacienteViewSet, basename='paciente')
router.register(r'seguros', SeguroMedicoViewSet, basename='seguro')
router.register(r'hospitalizaciones', HospitalizacionViewSet, basename='hospitalizacion')
router.register(r'recetas', RecetaViewSet, basename='receta')

urlpatterns = router.urls
