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
            
            if transaccion.tipo == 'DEPOSITO':
                usuario.cartera_monetaria += transaccion.cantidad
            
            elif transaccion.tipo == 'RETIRO':
                usuario.cartera_monetaria -= transaccion.cantidad
            
            elif transaccion.tipo == 'TRANSFERENCIA':
                usuario.cartera_monetaria -= transaccion.cantidad
                if transaccion.destinatario:
                    transaccion.destinatario.cartera_monetaria += transaccion.cantidad
                    transaccion.destinatario.save()

            usuario.save()

class ApuestaViewSet(viewsets.ModelViewSet):
    queryset = Apuesta.objects.all().order_by('-fecha')
    serializer_class = ApuestaSerializer

    # 1. AL CREAR LA APUESTA (Restamos el dinero apostado)
    def perform_create(self, serializer):
        with transaction.atomic():
            apuesta = serializer.save()
            usuario = apuesta.usuario
            
            # Cobramos la entrada
            usuario.cartera_monetaria -= apuesta.cantidad_apostada
            
            # OJO: Si por lo que sea creas la apuesta ya ganada directamente (raro, pero posible)
            if apuesta.ganancia > 0:
                usuario.cartera_monetaria += apuesta.ganancia
                
            usuario.save()

    # 2. AL RESOLVER LA APUESTA (Sumamos si gana)
    # Este método se activa cuando haces un PUT/PATCH para poner la ganancia
    def perform_update(self, serializer):
        with transaction.atomic():
            # Recuperamos la apuesta antigua para comparar (evitar pagar doble si editas dos veces)
            apuesta_antigua = self.get_object()
            ganancia_anterior = apuesta_antigua.ganancia
            
            # Guardamos los nuevos datos
            apuesta_nueva = serializer.save()
            usuario = apuesta_nueva.usuario
            
            # Calculamos la diferencia de ganancia
            # Si antes era 0 y ahora es 50, sumamos 50.
            # Si nos equivocamos y corregimos de 50 a 60, sumamos solo los 10 extra.
            diferencia_ganancia = apuesta_nueva.ganancia - ganancia_anterior
            
            if diferencia_ganancia != 0:
                usuario.cartera_monetaria += diferencia_ganancia
                usuario.save()