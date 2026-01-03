from django.urls import path, include
from .views import (
    IniciarSesionView, 
    FinalizarSesionView, 
    BalanceSesionView,
    ModificarSeguridadView
)


urlpatterns = [
    # RF5.1
    path('iniciar/', IniciarSesionView.as_view(), name='iniciar_sesion'),
    
    # RF5.2
    path('finalizar/', FinalizarSesionView.as_view(), name='finalizar_sesion'),
    
    # RF5.3
    path('balance/', BalanceSesionView.as_view(), name='balance_sesion'),
    
    # RF5.5 (Requiere ID de la sesión a modificar por el admin)
    path('seguridad/<int:pk>/', ModificarSeguridadView.as_view(), name='modificar_seguridad'),
]