from rest_framework import serializers
from .models import Sesion
from transacciones.models import Apuesta 
from usuarios.models import Jugador

# --- SERIALIZADOR AUXILIAR (Para ver las apuestas dentro del historial) ---
class HistorialApuestaSerializer(serializers.ModelSerializer):
    juego_nombre = serializers.CharField(source='juego.nombre', read_only=True)
    
    class Meta:
        model = Apuesta
        fields = ['fecha', 'juego_nombre', 'cantidad_apostada', 'ganancia', 'resultado']

# --- SERIALIZADORES PRINCIPALES ---

class IniciarSesionSerializer(serializers.ModelSerializer):
    dni_jugador = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Sesion
        fields = ['id', 'dni_jugador', 'saldo_inicio', 'regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora']

    def validate(self, data):
        dni = data.get('dni_jugador')
        
        # Validar existencia
        try:
            jugador = Jugador.objects.get(dni=dni)
        except Jugador.DoesNotExist:
            raise serializers.ValidationError({"dni_jugador": f"No existe el jugador con DNI {dni}"})

        # Validar duplicados
        if Sesion.objects.filter(usuario=jugador, activa=True).exists():
            raise serializers.ValidationError({"dni_jugador": f"El jugador {jugador.nombre} ya tiene sesión activa."})
            
        if data.get('saldo_inicio') < 0:
            raise serializers.ValidationError({"saldo_inicio": "El saldo debe ser positivo."})
        
        # 3. VALIDACIONES NUMÉRICAS (NUEVO: Anti-Negativos)
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

        # Si hemos encontrado algún error numérico, paramos aquí
        if errores_numericos:
            raise serializers.ValidationError(errores_numericos)
    
        # Guardamos el jugador para usarlo después
        self.context['jugador_validado'] = jugador
        return data

    
    def create(self, validated_data):
        # Eliminamos 'dni_jugador' de los datos porque ese campo NO existe en la tabla Sesion
        validated_data.pop('dni_jugador', None)
        
        # Creamos la sesión con los datos limpios
        return super().create(validated_data)

class FinalizarSesionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sesion
        fields = ['saldo_final']

class BalanceSesionSerializer(serializers.ModelSerializer):
    """ Para el LISTADO de la izquierda """
    beneficio_perdida = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Sesion
        # IMPORTANTE: Incluimos 'id' para que el botón 'Ver' funcione
        fields = ['id', 'fecha_actual', 'hora_inicio', 'hora_fin', 'saldo_inicio', 'saldo_final', 'beneficio_perdida', 'activa']

class HistorialSesionSerializer(serializers.ModelSerializer):
    """ Para el DETALLE de la derecha """
    juegos_jugados = HistorialApuestaSerializer(source='apuestas_sesion', many=True, read_only=True)
    
    class Meta:
        model = Sesion
        fields = ['id', 'fecha_actual', 'hora_inicio', 'hora_fin', 'saldo_inicio', 'saldo_final', 'juegos_jugados', 'activa']


class ModificarSeguridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sesion
        fields = ['regla1_limite_gasto_diario', 'regla2_limite_operaciones_hora']

    def validate(self, data):
        # También protegemos la modificación
        errores = {}
        if data.get('regla1_limite_gasto_diario', 0) < 0:
             errores['regla1_limite_gasto_diario'] = "El límite no puede ser negativo."
        if data.get('regla2_limite_operaciones_hora', 0) < 0:
             errores['regla2_limite_operaciones_hora'] = "El límite no puede ser negativo."
        
        if errores:
            raise serializers.ValidationError(errores)
        return data