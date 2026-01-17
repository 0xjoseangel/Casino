from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.db import transaction
from .models import Transaccion, Juega
from .serializers import TransaccionSerializer, JuegaSerializer

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
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Filtro adaptado para el frontend personalizado:
        - Admin: Puede ver todo, PERO si especifica usuario, filtramos por él.
        - Jugador: Solo ve lo suyo.
        """
        rol_param = self.request.query_params.get('rol')
        usuario_param = self.request.query_params.get('usuario')

        # 1. ¿Es Administrador?
        if rol_param == 'admin' or self.request.user.is_staff:
            # Si el admin quiere filtrar por un usuario específico:
            if usuario_param:
                return Transaccion.objects.filter(usuario__dni=usuario_param).order_by('-fecha')
            # Si no filtra, ve todo
            return Transaccion.objects.all().order_by('-fecha')

        # 2. ¿Es Jugador normal?
        if usuario_param:
             # Solo puede ver SU DNI (aunque aquí confiamos en el param porque es entorno local de práctica)
             # En prod real validaríamos que request.user == usuario_param
             return Transaccion.objects.filter(usuario__dni=usuario_param).order_by('-fecha')

        # 3. Fallback (auth estándar)
        if self.request.user.is_authenticated:
             return Transaccion.objects.filter(usuario__dni=self.request.user.username).order_by('-fecha')

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

class JuegaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar las apuestas (Juega).
    """
    queryset = Juega.objects.all().order_by('-fecha')
    serializer_class = JuegaSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # NOTA: En este proyecto la autenticación por token no está completamente implementada en el frontend,
        # así que usamos 'rol' y 'usuario' URL params como fallback de seguridad (igual que en TransaccionViewSet).
        
        rol_param = self.request.query_params.get('rol')
        usuario_param = self.request.query_params.get('usuario')
        usuario = self.request.user

        # 1. ¿Es Administrador? (Check param OR auth user)
        if rol_param == 'admin' or usuario.is_superuser or (usuario.is_authenticated and hasattr(usuario, 'rol') and usuario.rol == 'ADMINISTRADOR'):
            if usuario_param:
                return Juega.objects.filter(usuario__dni=usuario_param).order_by('-fecha')
            return Juega.objects.all().order_by('-fecha')
        
        # 2. ¿Es Jugador?
        # Si viene usuario_param, confiamos en él para entorno de prácticas (o si estuviera logueado)
        if usuario_param:
             return Juega.objects.filter(usuario__dni=usuario_param).order_by('-fecha')

        # 3. Fallback Auth estándar
        elif usuario.is_authenticated and hasattr(usuario, 'rol') and usuario.rol == 'JUGADOR':
            return Juega.objects.filter(usuario=usuario).order_by('-fecha')

        return Juega.objects.none()

    def perform_create(self, serializer):
        import random
        from decimal import Decimal

        with transaction.atomic():
            # 1. Obtener datos básicos
            usuario_apostador = serializer.validated_data['usuario']
            juego = serializer.validated_data['juego']
            cantidad = serializer.validated_data['cantidad_apostada']
            sesion_activa = None

            # 2. VINCULACIÓN DE SESIÓN
            if Sesion:
                sesion_activa = Sesion.objects.filter(usuario=usuario_apostador, activa=True).first()
            
            # NUEVO: Si no hay sesión, no se puede apostar.
            if not sesion_activa:
                from rest_framework.exceptions import ValidationError
                raise ValidationError("Debes iniciar una sesión de juego para poder apostar.")

            # 3. Guardamos la apuesta INICIAL (sin ganancia aun)
            apuesta = serializer.save(sesion=sesion_activa)
            
            # 4. LÓGICA DE JUEGO (Probabilidad y Multiplicadores)
            # Definir multiplicadores y probabilidad (1/X)
            multiplicador = 2.0 # Default
            probabilidad = 0.5  # Default
            
            nombre_juego = juego.nombre.lower()
            
            if 'ruleta' in nombre_juego:
                multiplicador = 36.0
                probabilidad = 1.0 / 36.0
            elif 'blackjack' in nombre_juego:
                multiplicador = 2.5 # Blackjack paga 3a2 o similar, simplificado x2.5 para dar juego
                probabilidad = 0.45 
            elif 'poker' in nombre_juego:
                multiplicador = 5.0
                probabilidad = 0.20
            elif 'tragaperras' in nombre_juego or 'slot' in nombre_juego:
                multiplicador = 10.0
                probabilidad = 0.10
            
            # Tirada de suerte
            suerte = random.random() # 0.0 a 1.0
            ganancia = 0
            
            print(f"🎲 JUEGO: {juego.nombre} | APUESTA: {cantidad} | MULT: x{multiplicador} | PROB: {probabilidad:.4f} | RND: {suerte:.4f}")

            if suerte < probabilidad:
                # GANADOR
                ganancia = cantidad * Decimal(str(multiplicador)) # Decimal conversion for safety
                print(f"   🎉 ¡GANADOR! Premio: {ganancia}")
            else:
                print("   ❌ No hubo suerte")

            # Actualizar la apuesta con la ganancia
            apuesta.ganancia = ganancia
            apuesta.save()

            # 5. ACTUALIZAR CARTERA USUARIO
            usuario = apuesta.usuario
            # Restar lo apostado
            usuario.cartera_monetaria -= cantidad
            # Sumar ganancia (si hubo)
            usuario.cartera_monetaria += ganancia
            
            usuario.save()

            # --- RF: PROMOCIONES (CASHBACK) ---
            from eventos.models import Promocion
            import re
            
            # Buscar si el usuario participa en alguna promo de 'Cashback' activa
            # Filter traverses: usuario -> participa -> promocion
            promociones_activas = usuario.promociones.filter(
                tipo='Cashback',
                estado=True,
                participa__promocion__estado=True # Asegurar doble check
            )

            for promo in promociones_activas:
                # Interpretar beneficio (ej: "10%", "5%")
                beneficio_str = promo.beneficio
                porcentaje = 0
                
                # Extraer número del string "10%"
                match = re.search(r'(\d+)', beneficio_str)
                if match:
                    porcentaje = int(match.group(1))
                
                if porcentaje > 0:
                    cashback = cantidad * Decimal(porcentaje) / Decimal(100)
                    usuario.cartera_monetaria += cashback
                    usuario.save()
                    print(f"   🎁 PROMO CASHBACK '{promo.nombre}': Devolviendo {cashback}€ ({porcentaje}%)")

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