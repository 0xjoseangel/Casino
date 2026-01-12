from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JugadorViewSet, AdministradorViewSet, login_view

router = DefaultRouter()
router.register(r'jugadores', JugadorViewSet)
router.register(r'administradores', AdministradorViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view),
]