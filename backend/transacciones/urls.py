from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransaccionViewSet, JuegaViewSet

router = DefaultRouter()
# Esto creará URLs como /api/movimientos/transacciones/ y /api/movimientos/apuestas/
router.register(r'transacciones', TransaccionViewSet)
router.register(r'apuestas', JuegaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]