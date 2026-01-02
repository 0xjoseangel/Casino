from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JuegoViewSet

router = DefaultRouter()
# Registramos el ViewSet. 
# El primer argumento r'juegos' define el prefijo de la URL.
router.register(r'juegos', JuegoViewSet, basename='juego')

urlpatterns = [
    path('', include(router.urls)),
]