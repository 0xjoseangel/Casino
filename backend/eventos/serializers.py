from rest_framework import serializers
from .models import Promocion, Torneo, Participa, Compite


class PromocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = '__all__'

    def validate(self, data):
        """
        RF4.1: Validación crítica - fecha_fin NO puede ser anterior a fecha_inicio
        """
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')

        # En updates parciales, obtener valores existentes si no vienen en data
        if self.instance:
            fecha_inicio = fecha_inicio or self.instance.fecha_inicio
            fecha_fin = fecha_fin or self.instance.fecha_fin

        if fecha_inicio and fecha_fin:
            if fecha_fin < fecha_inicio:
                raise serializers.ValidationError({
                    'fecha_fin': 'La fecha de fin no puede ser anterior a la fecha de inicio.'
                })

        return data


class TorneoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Torneo
        fields = '__all__'

    def validate_precio_inscripcion(self, value):
        """
        RF4.4: El precio_inscripcion no puede ser negativo
        """
        if value < 0:
            raise serializers.ValidationError(
                'El precio de inscripción no puede ser negativo.'
            )
        return value

    def validate_aforo_maximo(self, value):
        """
        RF4.4: El aforo debe ser mayor que 0
        """
        if value <= 0:
            raise serializers.ValidationError(
                'El aforo máximo debe ser mayor que 0.'
            )
        return value

    def validate(self, data):
        """
        Validaciones adicionales del torneo
        """
        fecha_inicio = data.get('fecha_inicio')

        # En updates parciales, obtener valor existente
        if self.instance and not fecha_inicio:
            fecha_inicio = self.instance.fecha_inicio

        return data


class ParticipaSerializer(serializers.ModelSerializer):
    """Serializer para inscripción a Promociones"""
    class Meta:
        model = Participa
        fields = '__all__'

    def validate(self, data):
        """Validar que no exista ya la inscripción"""
        jugador = data.get('jugador')
        promocion = data.get('promocion')

        # Verificar duplicados solo en creación
        if not self.instance:
            if Participa.objects.filter(jugador=jugador, promocion=promocion).exists():
                raise serializers.ValidationError(
                    'Ya estás inscrito en esta promoción.'
                )

        # Verificar que la promoción está activa
        if promocion and not promocion.estado:
            raise serializers.ValidationError(
                'No puedes inscribirte a una promoción inactiva.'
            )

        return data


class CompiteSerializer(serializers.ModelSerializer):
    """Serializer para inscripción a Torneos (RF4.6)"""
    class Meta:
        model = Compite
        fields = '__all__'

    def validate(self, data):
        """
        RF4.6: Validaciones de inscripción a torneo
        - No doble inscripción
        - Torneo debe estar abierto
        """
        jugador = data.get('jugador')
        torneo = data.get('torneo')

        # Verificar duplicados solo en creación
        if not self.instance:
            if Compite.objects.filter(jugador=jugador, torneo=torneo).exists():
                raise serializers.ValidationError(
                    'Ya estás inscrito en este torneo.'
                )

        # Verificar que el torneo permite inscripciones
        if torneo and torneo.estado not in ['programado', 'abierto']:
            raise serializers.ValidationError(
                'Este torneo no admite nuevas inscripciones.'
            )

        return data
