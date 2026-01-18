from rest_framework import serializers
from .models import Sesion
from transacciones.models import Juega 
from usuarios.models import Jugador

class HistorialApuestaSerializer(serializers.ModelSerializer):
    juego_nombre = serializers.CharField(source='juego.nombre', read_only=True)
    
    class Meta:
        model = Juega
        fields = ['fecha', 'juego_nombre', 'cantidad_apostada', 'ganancia', 'resultado']


class IniciarSesionSerializer(serializers.ModelSerializer):
    dni_jugador = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Sesion
        fields = ['id', 'dni_jugador', 'saldo_inicio', 'regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora']
        read_only_fields = ['id']

    def validate(self, data):
        errores_numericos = {}
        
        saldo = data.get('saldo_inicio')
        if saldo is not None and saldo < 0:
            errores_numericos['saldo_inicio'] = "El saldo inicial no puede ser negativo."

        limite_gasto = data.get('regla1_limite_gasto_diario')
        if limite_gasto is not None and limite_gasto < 0:
            errores_numericos['regla1_limite_gasto_diario'] = "El límite de gasto no puede ser negativo."

        limite_ops = data.get('regla2_limite_operaciones_hora')
        if limite_ops is not None and limite_ops < 0:
            errores_numericos['regla2_limite_operaciones_hora'] = "El límite de operaciones no puede ser negativo."

        if errores_numericos:
            raise serializers.ValidationError(errores_numericos)

        return data

    def create(self, validated_data):
        validated_data.pop('dni_jugador', None)
        return super().create(validated_data)


class FinalizarSesionSerializer(serializers.ModelSerializer):
    dni_jugador = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Sesion
        fields = ['dni_jugador']


class BalanceSesionSerializer(serializers.ModelSerializer):
    """ Para el Listado """
    beneficio_perdida = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    saldo_actual = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Sesion
        fields = ['id', 'fecha_actual', 'hora_inicio', 'hora_fin', 'saldo_inicio', 'saldo_actual', 'saldo_final', 'beneficio_perdida', 'activa']


class HistorialSesionSerializer(serializers.ModelSerializer):
    """ Para el Detalle """
    juegos_jugados = HistorialApuestaSerializer(source='apuestas_sesion', many=True, read_only=True)
    
    class Meta:
        model = Sesion
        fields = [
            'id', 'fecha_actual', 'hora_inicio', 'hora_fin', 
            'saldo_inicio', 'saldo_final', 'activa',
            'regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora',
            'juegos_jugados'
        ]


class ModificarSeguridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sesion
        fields = ['regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora']

    def validate(self, data):
        errores = {}
        if data.get('regla1_limite_gasto_diario', 0) < 0:
             errores['regla1_limite_gasto_diario'] = "El límite no puede ser negativo."
        if data.get('regla2_limite_operaciones_hora', 0) < 0:
             errores['regla2_limite_operaciones_hora'] = "El límite no puede ser negativo."
        
        if errores:
            raise serializers.ValidationError(errores)
        return data