from rest_framework import viewsets
from django.db import transaction
from .models import Transaccion, Apuesta
from .serializers import TransaccionSerializer, ApuestaSerializer

class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.all().order_by('-fecha')
    serializer_class = TransaccionSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            transaccion = serializer.save()
            usuario = transaccion.usuario
            
            # --- LÓGICA CON CARTERA_MONETARIA ---
            if transaccion.tipo == 'DEPOSITO':
                # Sumamos a la cartera
                usuario.cartera_monetaria += transaccion.cantidad
            
            elif transaccion.tipo == 'RETIRO':
                # Restamos de la cartera
                usuario.cartera_monetaria -= transaccion.cantidad
            
            elif transaccion.tipo == 'TRANSFERENCIA':
                # Restamos al origen
                usuario.cartera_monetaria -= transaccion.cantidad
                # Sumamos al destinatario
                if transaccion.destinatario:
                    transaccion.destinatario.cartera_monetaria += transaccion.cantidad
                    transaccion.destinatario.save()

            # Guardamos el cambio de saldo del usuario origen
            usuario.save()
            
class ApuestaViewSet(viewsets.ModelViewSet):
    queryset = Apuesta.objects.all().order_by('-fecha')
    serializer_class = ApuestaSerializer

    def perform_create(self, serializer):
        """
        Al crear la apuesta, RESTAMOS el dinero automáticamente.
        """
        with transaction.atomic():
            # 1. Guardamos la apuesta
            apuesta = serializer.save()
            
            # 2. Cobramos la apuesta al jugador
            usuario = apuesta.usuario
            usuario.cartera_monetaria -= apuesta.cantidad_apostada
            usuario.save()