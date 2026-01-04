from rest_framework import viewsets
from django.db import transaction
from .models import Transaccion, Apuesta
from .serializers import TransaccionSerializer, ApuestaSerializer

# Importamos el modelo Sesion de forma segura
try:
    from sesiones.models import Sesion
except ImportError:
    Sesion = None

class TransaccionViewSet(viewsets.ModelViewSet):
    # ✅ CORRECCIÓN IMPORTANTE:
    # Debemos dejar esta línea descomentada para que el Router de URLs no falle.
    # Aunque pongamos .all() aquí, el método get_queryset de abajo tiene prioridad
    # y es el que realmente aplicará el filtro de seguridad.
    queryset = Transaccion.objects.all().order_by('-fecha')
    serializer_class = TransaccionSerializer

    def get_queryset(self):
        """
        Filtro de seguridad:
        - Admin: Ve todo.
        - Jugador: Ve solo sus movimientos.
        """
        user = self.request.user

        # 1. Si no está autenticado, no ve nada (por seguridad)
        if not user.is_authenticated:
            return Transaccion.objects.none()

        # 2. Si es Administrador, lo ve todo
        if user.is_staff or user.is_superuser:
            return Transaccion.objects.all().order_by('-fecha')
        
        # 3. Si es Jugador normal, filtramos
        try:
            # Intentamos filtrar por DNI si el username coincide con el DNI
            return Transaccion.objects.filter(usuario__dni=user.username).order_by('-fecha')
        except:
            # Si falla, devolvemos lista vacía
            return Transaccion.objects.none()

    def perform_create(self, serializer):
        with transaction.atomic():
            transaccion = serializer.save()
            usuario = transaccion.usuario
            
            # --- 🕵️‍♂️ ZONA DE DEBUG (MIRA TU TERMINAL AL HACER EL RETIRO) ---
            print(f"\n📢 NUEVA TRANSACCIÓN RECIBIDA")
            print(f"   Tipo original: '{transaccion.tipo}'")
            print(f"   Cantidad: {transaccion.cantidad}")
            print(f"   Saldo ANTES: {usuario.cartera_monetaria}")

            # 1. TRUCO: Pasamos todo a mayúsculas para evitar errores de "Deposito" vs "DEPOSITO"
            tipo_normalizado = str(transaccion.tipo).upper().strip() # .strip() quita espacios extra
            print(f"   Tipo normalizado: '{tipo_normalizado}'")

            # 2. Lógica con el tipo normalizado
            if tipo_normalizado == 'DEPOSITO' or tipo_normalizado == 'DEPÓSITO': # Por si la tilde
                print("   ✅ Entrando en lógica de DEPÓSITO")
                usuario.cartera_monetaria += transaccion.cantidad
            
            elif tipo_normalizado == 'RETIRO':
                print("   ✅ Entrando en lógica de RETIRO")
                usuario.cartera_monetaria -= transaccion.cantidad
            
            elif tipo_normalizado == 'TRANSFERENCIA':
                print("   ✅ Entrando en lógica de TRANSFERENCIA")
                usuario.cartera_monetaria -= transaccion.cantidad
                if transaccion.destinatario:
                    # También sumamos al destinatario
                    print(f"   -> Sumando al destinatario {transaccion.destinatario}")
                    transaccion.destinatario.cartera_monetaria += transaccion.cantidad
                    transaccion.destinatario.save()
            else:
                print(f"   ⚠️ ALERTA: El tipo '{tipo_normalizado}' no coincide con ningún IF.")

            # 3. Guardamos el usuario
            usuario.save()
            print(f"   Saldo DESPUÉS: {usuario.cartera_monetaria}\n")

class ApuestaViewSet(viewsets.ModelViewSet):
    queryset = Apuesta.objects.all().order_by('-fecha')
    serializer_class = ApuestaSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            # 1. Obtener datos básicos
            usuario_apostador = serializer.validated_data['usuario']
            sesion_activa = None

            # 2. LÓGICA DE VINCULACIÓN DE SESIÓN (El "Pegamento" con Miguel Ángel)
            # Buscamos si hay una sesión activa para ese jugador
            if Sesion:
                sesion_activa = Sesion.objects.filter(usuario=usuario_apostador, activa=True).first()

            # 3. Guardamos la apuesta vinculándola a la sesión (si existe)
            apuesta = serializer.save(sesion=sesion_activa)
            
            # 4. LÓGICA DE COBRO (Tu parte)
            usuario = apuesta.usuario
            
            # Restar apuesta
            usuario.cartera_monetaria -= apuesta.cantidad_apostada
            
            # Sumar ganancia inmediata (si la hubiera)
            if apuesta.ganancia > 0:
                usuario.cartera_monetaria += apuesta.ganancia
                
            usuario.save()

    def perform_update(self, serializer):
        with transaction.atomic():
            apuesta_antigua = self.get_object()
            ganancia_anterior = apuesta_antigua.ganancia
            
            apuesta_nueva = serializer.save()
            usuario = apuesta_nueva.usuario
            
            # Calculamos la diferencia para ajustar el saldo
            diferencia_ganancia = apuesta_nueva.ganancia - ganancia_anterior
            
            if diferencia_ganancia != 0:
                usuario.cartera_monetaria += diferencia_ganancia
                usuario.save()