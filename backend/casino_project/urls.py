from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. USUARIOS: Todo lo de David irá en /api/usuarios/...
    path('api/usuarios/', include('usuarios.urls')), 
    
    # 2. TRANSACCIONES: Todo lo de Julián irá en /api/movimientos/...
    path('api/movimientos/', include('transacciones.urls')),
    
    # 3. JUEGOS: Todo lo de Minerva irá en /api/juegos/...
    path('api/juegos/', include('juegos.urls')), 
    
    # 4. EVENTOS: Lo tuyo irá en /api/eventos/...
    path('api/eventos/', include('eventos.urls')),

    # 5. SESIONES: Lo de Mangel irá en /api/sesiones/...
    path('api/sesiones/', include('sesiones.urls'))
]