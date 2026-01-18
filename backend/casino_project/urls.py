from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/usuarios/', include('usuarios.urls')), 
    
    path('api/movimientos/', include('transacciones.urls')),
    
    path('api/juegos/', include('juegos.urls')), 
    
    path('api/eventos/', include('eventos.urls')),

    path('api/sesiones/', include('sesiones.urls'))
]