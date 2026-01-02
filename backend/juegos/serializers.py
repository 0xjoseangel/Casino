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

    # RS2.1.3: La apuesta mínima no puede ser mayor que la máxima
    def validate(self, data):
        """
        Validación a nivel de objeto. Se usa cuando necesitamos comparar
        dos campos entre sí (apuesta_minima vs apuesta_maxima).
        """
        # Obtenemos los valores. Si es una actualización parcial, usamos los de la instancia existente.
        minima = data.get('apuesta_minima', getattr(self.instance, 'apuesta_minima', None))
        maxima = data.get('apuesta_maxima', getattr(self.instance, 'apuesta_maxima', None))

        if minima is not None and maxima is not None:
            if minima > maxima:
                # Lanzamos un error general o asociado a un campo específico
                raise serializers.ValidationError({
                    "apuesta_minima": "La apuesta mínima no puede superar a la apuesta máxima."
                })
        
        return data