from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .models import Sesion
from usuarios.models import Jugador 
from .serializers import (
    IniciarSesionSerializer, 
    FinalizarSesionSerializer, 
    BalanceSesionSerializer,
    ModificarSeguridadSerializer,
    HistorialSesionSerializer
)

# Utilidad para obtener jugador
def obtener_jugador(user):
    if user.is_anonymous:
        return None 
    return getattr(user, 'jugador', None)


class IniciarSesionView(generics.CreateAPIView):
    serializer_class = IniciarSesionSerializer
    permission_classes = [permissions.AllowAny] # Puerta abierta

    def perform_create(self, serializer):
        # Buscamos si el frontend nos ha enviado el DNI "en secreto"
        dni_enviado = serializer.validated_data.get('dni_jugador')
        
        jugador_real = None

        if dni_enviado:
            # Caso A: El frontend (Jugador) nos dice quién es por DNI
            try:
                jugador_real = Jugador.objects.get(dni=dni_enviado)
            except Jugador.DoesNotExist:
                raise ValidationError({"dni_jugador": f"No existe jugador con DNI {dni_enviado}"})
        else:
            # Caso B: Admin o Usuario autenticado normal
            user = self.request.user
            if user.is_authenticated:
                jugador_real = getattr(user, 'jugador', None)
        
        if not jugador_real:
             raise ValidationError({"usuario": "No se ha podido identificar al jugador. (Falta DNI o Login)"})

        # Comprobamos si YA tiene sesión activa
        if Sesion.objects.filter(usuario=jugador_real, activa=True).exists():
            raise ValidationError({"sesion": "Ya tienes una sesión activa. Ciérrala antes de empezar otra."})

        # Guardamos
        serializer.save(usuario=jugador_real)


class ListarSesionesView(generics.ListAPIView):
    serializer_class = BalanceSesionSerializer 
    # --- CORRECCIÓN AQUÍ: CAMBIADO A AllowAny PARA EVITAR EL ERROR 403 ---
    permission_classes = [permissions.AllowAny] 

    def get_queryset(self):
        # Devuelve TODAS las sesiones para que el Admin las vea
        return Sesion.objects.all().order_by('-fecha_actual', '-hora_inicio')


class FinalizarSesionView(APIView):
    permission_classes = [permissions.AllowAny] # Puerta abierta

    def post(self, request):
        serializer = FinalizarSesionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # 1. IDENTIFICAR AL JUGADOR (Por DNI o por Login)
        dni_enviado = serializer.validated_data.get('dni_jugador')
        jugador_real = None

        if dni_enviado:
            try:
                jugador_real = Jugador.objects.get(dni=dni_enviado)
            except Jugador.DoesNotExist:
                return Response({"error": "Jugador no encontrado"}, status=404)
        elif request.user.is_authenticated:
            jugador_real = getattr(request.user, 'jugador', None)

        if not jugador_real:
            return Response({"error": "No se pudo identificar al jugador"}, status=400)

        # 2. BUSCAR LA SESIÓN ACTIVA DE ESE JUGADOR
        try:
            sesion = Sesion.objects.get(usuario=jugador_real, activa=True)
        except Sesion.DoesNotExist:
            return Response({"error": "No tienes ninguna sesión activa para cerrar."}, status=400)
        
        # 3. CERRAR SESIÓN
        saldo_final = serializer.validated_data['saldo_final']
        sesion.finalizar_sesion(saldo_final)
        
        return Response({
            "mensaje": "Sesión finalizada correctamente", 
            "duracion": str(sesion.duracion_sesion),
            "saldo_final": sesion.saldo_final
        }, status=status.HTTP_200_OK)


class BalanceSesionView(generics.RetrieveAPIView):
    serializer_class = BalanceSesionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'
    queryset = Sesion.objects.all()


class HistorialJuegosView(generics.RetrieveAPIView):
    serializer_class = HistorialSesionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'
    queryset = Sesion.objects.all()


class ModificarSeguridadView(generics.UpdateAPIView):
    queryset = Sesion.objects.all()
    serializer_class = ModificarSeguridadSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'
    
    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data['mensaje'] = "Criterios de seguridad actualizados"
        return response


class ListarJugadoresDropdownView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        jugadores = Jugador.objects.all().values('dni', 'nombre', 'apellidos')
        return Response(list(jugadores), status=status.HTTP_200_OK)