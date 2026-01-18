from rest_framework import serializers
from .models import Juego

class JuegoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Juego
        fields = '__all__'

    # RS2.1.4: La apuesta mínima debe ser positiva
    def validate_apuesta_minima(self, value):
        if value <= 0:
            raise serializers.ValidationError("La apuesta mínima debe ser mayor a 0.")
        return value

    # RS2.1.4: La apuesta máxima debe ser positiva
    def validate_apuesta_maxima(self, value):
        if value <= 0:
            raise serializers.ValidationError("La apuesta máxima debe ser mayor a 0.")
        return value

    