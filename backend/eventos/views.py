from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import transaction
from .models import Promocion, Torneo, Participa, Compite
from usuarios.models import Jugador
from .serializers import (
    PromocionSerializer, TorneoSerializer,
    ParticipaSerializer, CompiteSerializer
)


def extraer_error_oracle(error_message):
    """Extrae el mensaje limpio de un error Oracle PL/SQL"""
    import re
    if 'ORA-' in error_message:
        match = re.search(r'ORA-\d+: (.*)', error_message)
        if match:
            return match.group(1).split('\n')[0]
    return error_message


class PromocionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de Promociones.
    Nota: La autenticación se maneja en el frontend (login personalizado).
    """
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            error_message = extraer_error_oracle(str(e))
            return Response({'detail': error_message}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            error_message = extraer_error_oracle(str(e))
            return Response({'detail': error_message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def habilitar(self, request, pk=None):
        """RF4.2: Habilitar promoción (cambiar estado a activo)"""
        promocion = self.get_object()

        if promocion.estado:
            return Response(
                {'error': 'La promoción ya está activa'},
                status=status.HTTP_400_BAD_REQUEST
            )

        promocion.estado = True
        promocion.fecha_activacion = timezone.now().date()
        promocion.save()

        return Response({
            'mensaje': f'Promoción "{promocion.nombre}" habilitada correctamente',
            'estado': promocion.estado
        })

    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """RF4.3: Finalizar promoción (cambiar estado a inactivo)"""
        promocion = self.get_object()

        if not promocion.estado:
            return Response(
                {'error': 'La promoción ya está inactiva'},
                status=status.HTTP_400_BAD_REQUEST
            )

        promocion.estado = False
        promocion.save()

        return Response({
            'mensaje': f'Promoción "{promocion.nombre}" finalizada correctamente',
            'estado': promocion.estado
        })

    @action(detail=True, methods=['get'])
    def inscritos(self, request, pk=None):
        """Obtener lista de jugadores inscritos a una promoción"""
        promocion = self.get_object()
        participaciones = Participa.objects.filter(promocion=promocion).select_related('jugador')

        inscritos = []
        for p in participaciones:
            inscritos.append({
                'dni': p.jugador.dni,
                'nombre': p.jugador.nombre,
                'apellidos': p.jugador.apellidos,
                'email': p.jugador.email,
                'fecha_inscripcion': p.fecha_inscripcion
            })

        return Response({
            'promocion': promocion.nombre,
            'total_inscritos': len(inscritos),
            'inscritos': inscritos
        })


class TorneoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de Torneos.
    Nota: La autenticación se maneja en el frontend (login personalizado).
    """
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            error_message = extraer_error_oracle(str(e))
            return Response({'detail': error_message}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            error_message = extraer_error_oracle(str(e))
            return Response({'detail': error_message}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """RF4.5: Finalizar torneo (marcar como 'finalizado')"""
        torneo = self.get_object()

        if torneo.estado == 'finalizado':
            return Response(
                {'error': 'El torneo ya está finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        torneo.estado = 'finalizado'
        torneo.save()

        return Response({
            'mensaje': f'Torneo "{torneo.nombre}" finalizado correctamente',
            'estado': torneo.estado
        })

    @action(detail=True, methods=['post'])
    def abrir(self, request, pk=None):
        """Abrir inscripciones del torneo"""
        torneo = self.get_object()

        if torneo.estado != 'programado':
            return Response(
                {'error': 'Solo se pueden abrir torneos programados'},
                status=status.HTTP_400_BAD_REQUEST
            )

        torneo.estado = 'abierto'
        torneo.save()

        return Response({
            'mensaje': f'Inscripciones abiertas para "{torneo.nombre}"',
            'estado': torneo.estado
        })

    @action(detail=True, methods=['get'])
    def inscritos(self, request, pk=None):
        """Obtener lista de jugadores inscritos a un torneo"""
        torneo = self.get_object()
        competiciones = Compite.objects.filter(torneo=torneo).select_related('jugador')

        inscritos = []
        for c in competiciones:
            inscritos.append({
                'dni': c.jugador.dni,
                'nombre': c.jugador.nombre,
                'apellidos': c.jugador.apellidos,
                'email': c.jugador.email,
                'posicion': c.posicion
            })

        return Response({
            'torneo': torneo.nombre,
            'aforo_maximo': torneo.aforo_maximo,
            'total_inscritos': len(inscritos),
            'plazas_disponibles': torneo.aforo_maximo - len(inscritos),
            'inscritos': inscritos
        })


class ParticipaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para inscripción a Promociones.
    """
    queryset = Participa.objects.all()
    serializer_class = ParticipaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Participa.objects.all()
        jugador = self.request.query_params.get('jugador')
        if jugador:
            queryset = queryset.filter(jugador__dni=jugador)
        return queryset


class CompiteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para inscripción a Torneos.
    RF4.6: Un jugador puede inscribirse a torneos.
    - La doble inscripción se previene en el método create y por unique_together en el modelo
    """
    queryset = Compite.objects.all()
    serializer_class = CompiteSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Validación adicional al inscribirse"""
        torneo_id = request.data.get('torneo')
        jugador_dni = request.data.get('jugador')

        # Verificar que el torneo existe y está abierto
        try:
            torneo = Torneo.objects.get(pk=torneo_id)
        except Torneo.DoesNotExist:
            return Response(
                {'error': 'El torneo no existe'},
                status=status.HTTP_404_NOT_FOUND
            )

        if torneo.estado not in ['programado', 'abierto']:
            return Response(
                {'error': 'No se puede inscribir a un torneo cerrado o finalizado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar aforo
        inscritos = Compite.objects.filter(torneo=torneo).count()
        if inscritos >= torneo.aforo_maximo:
            return Response(
                {'error': 'El torneo ha alcanzado el aforo máximo'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar doble inscripción
        if Compite.objects.filter(torneo_id=torneo_id, jugador_id=jugador_dni).exists():
            return Response(
                {'error': 'Ya estás inscrito en este torneo'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener el jugador y verificar saldo suficiente
        try:
            jugador = Jugador.objects.get(pk=jugador_dni)
        except Jugador.DoesNotExist:
            return Response(
                {'error': 'El jugador no existe'},
                status=status.HTTP_404_NOT_FOUND
            )

        precio = torneo.precio_inscripcion
        if jugador.cartera_monetaria < precio:
            return Response(
                {'error': f'Saldo insuficiente. Necesitas {precio}€ y tienes {jugador.cartera_monetaria}€'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cobrar la inscripción y crear la relación en una transacción atómica
        with transaction.atomic():
            jugador.cartera_monetaria -= int(precio)
            jugador.save()
            return super().create(request, *args, **kwargs)
