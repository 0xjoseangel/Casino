from rest_framework import serializers
from .models import Sesion
from transacciones.models import Transaccion, Apuesta

class IniciarSesionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sesion
        fields = ['saldo_inicio', 'regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora']

    def validate(self, data):
        """
        RF5.1: Validaciones de inicio[cite: 1971, 1974, 1977].
        """
        user = self.context['request'].user
        
        # RS5.1.1: No puede haber dos sesiones activas a la vez
        if Sesion.objects.filter(usuario=user, activa=True).exists():
            raise serializers.ValidationError("Ya existe una sesión activa para este usuario.")
            
        # RS5.1.3: Saldo inicial positivo
        if data.get('saldo_inicio') < 0:
            raise serializers.ValidationError("El saldo inicial debe ser mayor o igual a 0.")
            
        # RS5.1.5: Límites válidos
        if data.get('regla1_limite_gasto_diario') < 0 or data.get('regla2_limite_operaciones_hora') < 0:
             raise serializers.ValidationError("Los límites de seguridad no pueden ser negativos.")
             
        return data

class FinalizarSesionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sesion
        fields = ['saldo_final']
        
    def validate_saldo_final(self, value):
        # RS5.2.1: El saldo final debe ser válido [cite: 1993]
        if value < 0:
            raise serializers.ValidationError("El saldo final no puede ser negativo.")
        return value

class BalanceSesionSerializer(serializers.ModelSerializer):
    """
    RF5.3: Estructura de salida del reporte de balance[cite: 2006].
    """
    beneficio_perdida = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Sesion
        fields = ['fecha_actual', 'hora_inicio', 'hora_fin', 'saldo_inicio', 'saldo_final', 'beneficio_perdida']

class ModificarSeguridadSerializer(serializers.ModelSerializer):
    """
    RF5.5: Modificación de criterios por administrador[cite: 2031].
    """
    class Meta:
        model = Sesion
        fields = ['regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora']

    def validate(self, data):
        # RS5.5.2: Parámetros inválidos [cite: 2037]
        if data.get('regla1_limite_gasto_diario', 0) < 0 or data.get('regla2_limite_operaciones_hora', 0) < 0:
            raise serializers.ValidationError("Los valores de los límites no pueden ser negativos.")
        return data
    
class HistorialApuestaSerializer(serializers.ModelSerializer):
    """
    Serializador auxiliar para mostrar los detalles de cada jugada en el historial.
    """
    juego_nombre = serializers.CharField(source='juego.nombre', read_only=True)
    
    class Meta:
        model = Apuesta
        fields = ['fecha', 'juego_nombre', 'cantidad_apostada', 'ganancia', 'resultado']

class HistorialSesionSerializer(serializers.ModelSerializer):
    """
    RF5.4: Estructura completa del historial de la sesión.
    Devuelve los datos de la sesión y la lista de juegos (apuestas) realizados.
    """
    # Usamos el related_name definido por Julián en su modelo Apuesta
    juegos_jugados = HistorialApuestaSerializer(source='apuestas_sesion', many=True, read_only=True)
    
    class Meta:
        model = Sesion
        fields = ['id', 'fecha_actual', 'hora_inicio', 'hora_fin', 'saldo_inicio', 'saldo_final', 'juegos_jugados']