from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from decimal import Decimal 

# --- IMPORTACIONES PARA CÁLCULOS ---
from django.db.models import Sum, DecimalField
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

        # 1. Identificar al Jugador
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

        # 2. Comprobar si ya tiene sesión activa
        if Sesion.objects.filter(usuario=jugador_real, activa=True).exists():
            raise ValidationError({"sesion": "Ya tienes una sesión activa."})

        # 3. --- NUEVA RESTRICCIÓN: NO SUPERAR SALDO DE CARTERA ---
        saldo_inicio = serializer.validated_data.get('saldo_inicio')
        
        # Convertimos a Decimal para comparar peras con peras
        saldo_inicio_dec = Decimal(str(saldo_inicio)) 
        
        if saldo_inicio_dec > jugador_real.cartera_monetaria:
            raise ValidationError({
                "saldo_inicio": f"Saldo insuficiente. Intentas iniciar con {saldo_inicio_dec}€ pero solo tienes {jugador_real.cartera_monetaria}€ en tu cartera."
            })
        # ---------------------------------------------------------

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
        
        # 3. CÁLCULO ESTADÍSTICO DEL SALDO FINAL
        resumen_juego = sesion.apuestas_sesion.aggregate(
            total_apostado=Coalesce(Sum('cantidad_apostada'), 0, output_field=DecimalField()),
            total_ganado=Coalesce(Sum('ganancia'), 0, output_field=DecimalField())
        )
        
        apostado = Decimal(resumen_juego['total_apostado'])
        ganado = Decimal(resumen_juego['total_ganado'])
        saldo_inicio_dec = Decimal(sesion.saldo_inicio)
        
        # Calculamos saldo final teórico
        saldo_calculado = saldo_inicio_dec - apostado + ganado
        
        # 4. CERRAR SESIÓN
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