from rest_framework import serializers
from .models import Jugador, Administrador
from datetime import date
import re

class JugadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Jugador
        fields = '__all__'

    def validate_dni(self, value):
        # RS1.1.1: Formato estándar español (8 dígitos + letra mayúscula) [cite: 89]
        if not re.match(r'^\d{8}[A-Z]$', value):
            raise serializers.ValidationError("El DNI debe tener 8 números y una letra mayúscula.")
        return value

    def validate_fecha_nacimiento(self, value):
        # RS1.1.2: El usuario debe ser mayor de 18 años [cite: 91]
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("Debes ser mayor de 18 años para registrarte.")
        return value