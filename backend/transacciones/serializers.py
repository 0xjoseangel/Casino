from rest_framework import serializers
from .models import Transaccion, Juega

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = '__all__'

    def validate(self, data):
        usuario = data['usuario']
        tipo = data['tipo']
        cantidad = data['cantidad']

        if cantidad <= 0:
            raise serializers.ValidationError("La cantidad debe ser positiva.")

        # --- VALIDACIONES DE DEPÓSITO ---
        if tipo == 'DEPOSITO':
             if cantidad > 10000:
                 raise serializers.ValidationError("El depósito máximo permitido es de 10.000€.")

        # --- VALIDACIONES DE RETIRO ---
        if tipo == 'RETIRO':
            if cantidad < 20:
                raise serializers.ValidationError("El retiro mínimo es de 20€.")
            
            # CAMBIO AQUÍ: Usamos cartera_monetaria
            if usuario.cartera_monetaria < cantidad:
                raise serializers.ValidationError(f"Saldo insuficiente. Tienes {usuario.cartera_monetaria}€ y quieres retirar {cantidad}€.")

        # --- VALIDACIONES DE TRANSFERENCIA ---
        if tipo == 'TRANSFERENCIA':
            if not data.get('destinatario'):
                raise serializers.ValidationError("Las transferencias necesitan un destinatario.")
            
            # CAMBIO AQUÍ: Usamos cartera_monetaria
            if usuario.cartera_monetaria < cantidad:
                raise serializers.ValidationError("No tienes saldo suficiente para transferir.")
            
            if usuario == data['destinatario']:
                raise serializers.ValidationError("No puedes transferirte dinero a ti mismo.")

        return data

class JuegaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Juega
    """
    usuario_dni = serializers.CharField(source='usuario.dni', read_only=True)
    juego_nombre = serializers.CharField(source='juego.nombre', read_only=True)

    class Meta:
        model = Juega
        fields = '__all__'

    def validate(self, data):
        """
        Validamos que el jugador tenga dinero para jugar.
        """
        usuario = data['usuario']
        cantidad = data['cantidad_apostada']

        # 1. No se puede apostar negativo ni cero
        if cantidad <= 0:
            raise serializers.ValidationError("La apuesta debe ser mayor a 0.")


        # 2. Rango de Apuestas (RF Nuevo)
        if cantidad < 10:
            raise serializers.ValidationError("La apuesta mínima es de 10€.")
        if cantidad > 1000:
            raise serializers.ValidationError("La apuesta máxima es de 1.000€.")

        return data