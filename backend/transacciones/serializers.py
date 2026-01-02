from rest_framework import serializers
from .models import Transaccion, Apuesta

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

class ApuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apuesta
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

        # 2. Verificar saldo (Usamos cartera_monetaria)
        if usuario.cartera_monetaria < cantidad:
            raise serializers.ValidationError(
                f"No tienes fichas suficientes. Tienes {usuario.cartera_monetaria}€ y quieres apostar {cantidad}€."
            )

        return data