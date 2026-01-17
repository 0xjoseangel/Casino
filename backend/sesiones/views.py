from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404

# --- IMPORTACIONES PARA CÁLCULOS ---
from django.db.models import Sum, DecimalField # <--- AÑADIDO DecimalField
from django.db.models.functions import Coalesce 
# -----------------------------------

from .models import Sesion
from usuarios.models import Jugador 
from .serializers import (
    IniciarSesionSerializer, 
    FinalizarSesionSerializer, 
    BalanceSesionSerializer,
    ModificarSeguridadSerializer,
    HistorialSesionSerializer
)

def obtener_jugador(user):
    if user.is_anonymous:
        return None 
    return getattr(user, 'jugador', None)


class IniciarSesionView(generics.CreateAPIView):
    serializer_class = IniciarSesionSerializer
    permission_classes = [permissions.AllowAny] 

    def perform_create(self, serializer):
        dni_enviado = serializer.validated_data.get('dni_jugador')
        jugador_real = None

        if dni_enviado:
            try:
                jugador_real = Jugador.objects.get(dni=dni_enviado)
            except Jugador.DoesNotExist:
                raise ValidationError({"dni_jugador": f"No existe jugador con DNI {dni_enviado}"})
        else:
            user = self.request.user
            if user.is_authenticated:
                jugador_real = getattr(user, 'jugador', None)
        
        if not jugador_real:
             raise ValidationError({"usuario": "No se ha podido identificar al jugador."})

        if Sesion.objects.filter(usuario=jugador_real, activa=True).exists():
            raise ValidationError({"sesion": "Ya tienes una sesión activa."})

        serializer.save(usuario=jugador_real)


class ListarSesionesView(generics.ListAPIView):
    serializer_class = BalanceSesionSerializer 
    permission_classes = [permissions.AllowAny] 

    def get_queryset(self):
        return Sesion.objects.all().order_by('-fecha_actual', '-hora_inicio')


class FinalizarSesionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = FinalizarSesionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        # 1. IDENTIFICAR JUGADOR
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

        # 2. BUSCAR SESIÓN ACTIVA
        try:
            sesion = Sesion.objects.get(usuario=jugador_real, activa=True)
        except Sesion.DoesNotExist:
            return Response({"error": "No tienes ninguna sesión activa para cerrar."}, status=400)
        
        # 3. CÁLCULO AUTOMÁTICO DEL SALDO FINAL
        # CORRECCIÓN AQUÍ: Añadimos output_field=DecimalField() para evitar el error de tipos mixtos
        resumen_juego = sesion.apuestas_sesion.aggregate(
            total_apostado=Coalesce(Sum('cantidad_apostada'), 0, output_field=DecimalField()),
            total_ganado=Coalesce(Sum('ganancia'), 0, output_field=DecimalField())
        )
        
        apostado = float(resumen_juego['total_apostado'])
        ganado = float(resumen_juego['total_ganado'])
        
        # Calculamos saldo
        saldo_calculado = float(sesion.saldo_inicio) - apostado + ganado
        
        # 4. GUARDAR Y CERRAR
        sesion.finalizar_sesion(saldo_calculado)
        
        return Response({
            "mensaje": "Sesión finalizada correctamente", 
            "duracion": str(sesion.duracion_sesion),
            "saldo_inicio": sesion.saldo_inicio,
            "balance_juego": f"-{apostado}€ jugados / +{ganado}€ ganados",
            "saldo_final": saldo_calculado
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