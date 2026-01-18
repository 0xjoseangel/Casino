from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransaccionViewSet, JuegaViewSet

router = DefaultRouter()
router.register(r'transacciones', TransaccionViewSet)
router.register(r'apuestas', JuegaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]