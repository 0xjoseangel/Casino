from rest_framework import serializers
from .models import Juego
from django.db.models import Sum

class JuegoSerializer(serializers.ModelSerializer):
    # Campo calculado para la rentabilidad (dinero)
    rentabilidad = serializers.SerializerMethodField()

    class Meta:
        model = Juego
        # LISTA DEFINITIVA DE CAMPOS: 
        # Si un campo no está aquí, React no lo verá jamás.
        fields = [
            'id', 
            'nombre', 
            'tipo', 
            'apuesta_minima', 
            'apuesta_maxima', 
            'estado', 
            'descripcion',  # <--- Fundamental para que aparezca al modificar
            'rentabilidad'
        ]

    def get_rentabilidad(self, obj):
        """
        Calcula el beneficio del casino: (Total Apostado - Total Pagado).
        """
        try:
            # Accedemos a la relación con el modelo Juega de tus compañeros
            stats = obj.apuestas_realizadas.aggregate(
                total_apostado=Sum('cantidad_apostada'),
                total_pagado=Sum('ganancia')
            )
            
            apostado = float(stats['total_apostado'] or 0)
            pagado = float(stats['total_pagado'] or 0)
            
            # Resultado en euros
            return round(apostado - pagado, 2)
        except Exception:
            # Si hay error en la relación o base de datos, devolvemos 0
            return 0.0

    # --- VALIDACIONES (RS2.1.4) ---

    def validate_apuesta_minima(self, value):
        if value <= 0:
            raise serializers.ValidationError("La apuesta mínima debe ser mayor a 0.")
        return value

    def validate_apuesta_maxima(self, value):
        if value <= 0:
            raise serializers.ValidationError("La apuesta máxima debe ser mayor a 0.")
        return value

    def validate(self, data):
        """
        Validación cruzada entre mínima y máxima.
        """
        minima = data.get('apuesta_minima')
        maxima = data.get('apuesta_maxima')
        
        if minima is not None and maxima is not None and minima > maxima:
            raise serializers.ValidationError({
                "apuesta_minima": "La apuesta mínima no puede ser mayor que la máxima."
            })
        return data