from rest_framework import viewsets
from django.db import transaction
from .models import Transaccion, Apuesta
from .serializers import TransaccionSerializer, ApuestaSerializer

# 🔴 NUEVO: Importamos el modelo Sesion de la app de tu compañero
# Si esto da error, asegúrate de que la app 'sesiones' existe y tiene el modelo.
try:
    from sesiones.models import Sesion
except ImportError:
    Sesion = None  # Fallback por si la app de sesiones no está lista aún

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

    # 1. AL CREAR LA APUESTA (Restamos dinero + Vinculamos Sesión)
    def perform_create(self, serializer):
        with transaction.atomic():
            # 🔴 NUEVO: LÓGICA DE VINCULACIÓN DE SESIÓN
            # 1. Obtenemos quién está apostando (del formulario)
            usuario_apostador = serializer.validated_data['usuario']
            sesion_activa = None

            # 2. Buscamos si ese usuario tiene una sesión 'activa=True'
            if Sesion:
                sesion_activa = Sesion.objects.filter(usuario=usuario_apostador, activa=True).first()

            # 3. Guardamos la apuesta inyectando la sesión encontrada (o None si no hay)
            apuesta = serializer.save(sesion=sesion_activa)
            
            # --- FIN DE LO NUEVO, AHORA TU LÓGICA DE COBRO ---

            usuario = apuesta.usuario
            
            # Cobramos la entrada
            usuario.cartera_monetaria -= apuesta.cantidad_apostada
            
            # Si se crea ya ganada
            if apuesta.ganancia > 0:
                usuario.cartera_monetaria += apuesta.ganancia
                
            usuario.save()

    # 2. AL RESOLVER LA APUESTA (Igual que antes)
    def perform_update(self, serializer):
        with transaction.atomic():
            apuesta_antigua = self.get_object()
            ganancia_anterior = apuesta_antigua.ganancia
            
            apuesta_nueva = serializer.save()
            usuario = apuesta_nueva.usuario
            
            diferencia_ganancia = apuesta_nueva.ganancia - ganancia_anterior
            
            if diferencia_ganancia != 0:
                usuario.cartera_monetaria += diferencia_ganancia
                usuario.save()