
# Create your views here.
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Sesion
from .serializers import (
    IniciarSesionSerializer, 
    FinalizarSesionSerializer, 
    BalanceSesionSerializer,
    ModificarSeguridadSerializer,
    HistorialSesionSerializer
)

# RF5.1: Comenzar Sesión 
class IniciarSesionView(generics.CreateAPIView):
    serializer_class = IniciarSesionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        
        # LÓGICA DE SEGURIDAD DE TIPOS:
        # Intentamos obtener la instancia de 'Jugador'.
        # Si vuestro Auth User ya es Jugador, usamos 'user'.
        # Si tenéis un User estándar vinculado a Jugador (OneToOne), usamos 'user.jugador'.
        
        jugador_real = getattr(user, 'jugador', user) 
        # (Esto busca si existe el atributo .jugador, si no, usa el user tal cual)

        serializer.save(usuario=jugador_real)
# RF5.2: Finalizar Sesión 
class FinalizarSesionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        jugador_real = getattr(user, 'jugador', user)
        # RS5.2.2: Debe existir sesión activa 
        sesion = get_object_or_404(Sesion, usuario=jugador_real, activa=True)
        
        serializer = FinalizarSesionSerializer(data=request.data)
        if serializer.is_valid():
            # Ejecutamos la lógica de cierre definida en el modelo
            sesion.finalizar_sesion(serializer.validated_data['saldo_final'])
            
            return Response({
                "mensaje": "Sesión finalizada correctamente", 
                "duracion": str(sesion.duracion_sesion),
                "saldo_final": sesion.saldo_final
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# RF5.3: Obtener Balance de Sesión 
class BalanceSesionView(generics.RetrieveAPIView):
    serializer_class = BalanceSesionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'  # CAMBIO: Ahora buscamos por ID, igual que en el historial

    def get_queryset(self):
        """
        Permite consultar cualquier sesión del usuario (activa o cerrada).
        """
        user = self.request.user
        jugador_real= getattr(user, 'jugador', user)
        return Sesion.objects.filter(usuario=jugador_real)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Calculamos el beneficio/pérdida en tiempo de ejecución
        saldo_fin = instance.saldo_final if instance.saldo_final is not None else instance.saldo_inicio 
        # (Si está activa, el "final" temporal es el actual, aquí simplificado al inicio)
        
        data['beneficio_perdida'] = saldo_fin - instance.saldo_inicio
        return Response(data)

class ListarSesionesView(generics.ListAPIView):
    """
    Devuelve la lista simple de todas las sesiones del usuario para el menú lateral.
    """
    serializer_class = BalanceSesionSerializer # Reutilizamos este que ya tiene datos básicos
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # SI ES ADMIN: Ve todas las sesiones de la base de datos
        if user.is_staff or user.is_superuser:
            return Sesion.objects.all().order_by('-fecha_actual', '-hora_inicio')
            


# RF5.4: Listar historial de juegos (Modificado para soportar sesiones cerradas)
class HistorialJuegosView(generics.RetrieveAPIView):
    serializer_class = HistorialSesionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'  # Buscaremos por la Clave Primaria (ID de la sesión)

    def get_queryset(self):
        """
        Devuelve el universo de sesiones disponibles para este usuario.
        Al no filtrar por 'activa=True', permite consultar el historial de sesiones cerradas.
        """
        user = self.request.user
        jugador_real = getattr(user, 'jugador', user)
        # RS5.4.1: Vinculación estricta al usuario autenticado
        return Sesion.objects.filter(usuario=jugador_real)

    # Nota: Ya no necesitamos sobrescribir get_object(), 
    # RetrieveAPIView se encarga de buscar la sesión concreta usando el 'pk' de la URL 
    # dentro del queryset que definimos arriba.

# RF5.5: Modificar criterios de seguridad 
class ModificarSeguridadView(generics.UpdateAPIView):
    queryset = Sesion.objects.all()
    serializer_class = ModificarSeguridadSerializer
    permission_classes = [permissions.IsAdminUser] # Solo Admin 
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data['mensaje'] = "Criterios de seguridad actualizados"
        return response