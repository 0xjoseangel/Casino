from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Sesion
from usuarios.models import Jugador # Importante
from .serializers import (
    IniciarSesionSerializer, 
    FinalizarSesionSerializer, 
    BalanceSesionSerializer,
    ModificarSeguridadSerializer,
    HistorialSesionSerializer
)

# --- FUNCIÓN AUXILIAR PARA MODO DESARROLLO ---
def obtener_jugador_seguro(user):
    """
    Si el usuario es anónimo (pruebas frontend), devuelve el primer jugador de la BD.
    Si es un usuario real, devuelve su perfil de jugador.
    """
    if user.is_anonymous:
        # TRUCO: Si no hay login, cogemos el primer jugador (el Admin)
        jugador = Jugador.objects.first()
        if not jugador:
            raise Exception("¡ERROR! No hay jugadores en la base de datos. Crea uno en /admin primero.")
        return jugador
    
    # Lógica normal
    return getattr(user, 'jugador', user)


# RF5.1: Comenzar Sesión
class IniciarSesionView(generics.CreateAPIView):
    serializer_class = IniciarSesionSerializer
    permission_classes = [permissions.AllowAny] # Puerta abierta para pruebas

    def perform_create(self, serializer):
        jugador_real = obtener_jugador_seguro(self.request.user)
        serializer.save(usuario=jugador_real)

# RF5.2: Finalizar Sesión
class FinalizarSesionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        jugador_real = obtener_jugador_seguro(request.user)
        
        # Buscamos la sesión activa de ese jugador
        sesion = get_object_or_404(Sesion, usuario=jugador_real, activa=True)
        
        serializer = FinalizarSesionSerializer(data=request.data)
        if serializer.is_valid():
            sesion.finalizar_sesion(serializer.validated_data['saldo_final'])
            return Response({
                "mensaje": "Sesión finalizada correctamente", 
                "duracion": str(sesion.duracion_sesion),
                "saldo_final": sesion.saldo_final
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# RF5.3: Obtener Balance de Sesión (Por ID)
class BalanceSesionView(generics.RetrieveAPIView):
    serializer_class = BalanceSesionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'

    def get_queryset(self):
        # Permitimos ver cualquier sesión en modo desarrollo
        return Sesion.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Calculamos beneficio
        saldo_fin = instance.saldo_final if instance.saldo_final is not None else instance.saldo_inicio 
        data['beneficio_perdida'] = saldo_fin - instance.saldo_inicio
        return Response(data)

# LISTADO: Para el menú lateral
class ListarSesionesView(generics.ListAPIView):
    serializer_class = BalanceSesionSerializer 
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        
        # MODO DESARROLLO: Si es anónimo o Admin, ve TODO
        if user.is_anonymous or user.is_staff or user.is_superuser:
            return Sesion.objects.all().order_by('-fecha_actual', '-hora_inicio')

        # MODO NORMAL: Solo sus sesiones
        jugador_real = getattr(user, 'jugador', user)
        return Sesion.objects.filter(usuario=jugador_real).order_by('-fecha_actual', '-hora_inicio')

# RF5.4: Historial de Juegos (Detalle)
class HistorialJuegosView(generics.RetrieveAPIView):
    serializer_class = HistorialSesionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'

    def get_queryset(self):
        # Permitimos consultar cualquier sesión por su ID
        return Sesion.objects.all()

# RF5.5: Modificar seguridad
class ModificarSeguridadView(generics.UpdateAPIView):
    queryset = Sesion.objects.all()
    serializer_class = ModificarSeguridadSerializer
    permission_classes = [permissions.AllowAny] # Simplificado para pruebas
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data['mensaje'] = "Criterios de seguridad actualizados"
        return response