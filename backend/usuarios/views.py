from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Jugador, Administrador
from .serializers import JugadorSerializer, AdministradorSerializer, JugadorDetalleSerializer


class JugadorViewSet(viewsets.ModelViewSet):
    queryset = Jugador.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'list', 'update', 'partial_update']:
             return JugadorDetalleSerializer
        return JugadorSerializer

    # RF1.1: Registro de jugador (Solo Admin lo usa)
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                {'mensaje': 'Jugador registrado correctamente en el sistema'}, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            # Capturar errores de base de datos (Triggers Oracle)
            # Los triggers suelen lanzar excepciones que Django envuelve en DatabaseError o IntegrityError
            error_message = str(e)
            if 'ORA-' in error_message:
                # Intentar limpiar el mensaje de error de Oracle
                # Ejemplo: ORA-20001: El jugador es menor de edad
                import re
                match = re.search(r'ORA-\d+: (.*)', error_message)
                if match:
                    error_message = match.group(1).split('\n')[0] # Quedarse solo con el texto del error
            
            return Response({'detail': error_message}, status=status.HTTP_400_BAD_REQUEST)

    # RF1.2: Baja de jugador (Admin o Propio Jugador)
    @action(detail=True, methods=['post'])
    def baja_jugador(self, request, pk=None):
        jugador = self.get_object()
        
        # Caso 1: Administrador (No necesita contraseña, pasamos un flag en el body)
        es_admin = request.data.get('es_admin', False)
        
        if es_admin:
            jugador.baja = True
            jugador.save()
            return Response({'mensaje': 'Jugador dado de baja correctamente (Admin)'}, status=status.HTTP_200_OK)

        # Caso 2: Propio Jugador (Necesita contraseña)
        password = request.data.get('contrasena')
        
        # Asignamos la contraseña que viene del usuario al objeto
        # IMPORTANTE: Esto es para que el Trigger de Oracle compare :NEW.CONTRASENA con :OLD.CONTRASENA
        if password:
            jugador.contrasena = password

        jugador.baja = True
        
        # Guardamos enviando explícitamente la contraseña para que el trigger la valide
        # Si la contraseña es incorrecta (diferente a la de la BD), el trigger lanzará error ORA-20004
        jugador.save(update_fields=['baja', 'contrasena'])
        
        return Response({'mensaje': 'Tu cuenta ha sido dada de baja correctamente'}, status=status.HTTP_200_OK)

    # RF1.3: Consultar datos de jugador
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # RF1.4: Modificar datos de jugador
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        # Usamos JugadorSerializer para permitir editar todo (incluida contraseña si viene)
        serializer = JugadorSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        # RDS1.4.1: Mensaje de confirmación
        return Response({'mensaje': 'Datos del jugador modificados correctamente'}, status=status.HTTP_200_OK)

    # RF_EXTRA: Alta de jugador (Solo Admin - Reactivación)
    @action(detail=True, methods=['post'])
    def alta_jugador(self, request, pk=None):
        # Asumimos que solo el admin llama a esto desde el panel
        jugador = self.get_object()
        jugador.baja = False
        jugador.save()
        return Response({'mensaje': 'Jugador reactivado correctamente'}, status=status.HTTP_200_OK)

class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.filter(baja=False)
    serializer_class = AdministradorSerializer
    
# LOGIN UNIFICADO (JUGADORES Y ADMINS)
@api_view(['POST'])
@permission_classes([AllowAny]) 
def login_view(request):
    dni = request.data.get('dni')
    password = request.data.get('contrasena')  

    if not dni or not password:
        return Response({'error': 'Faltan credenciales'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. BUSCAR EN ADMINISTRADORES
    try:
        admin = Administrador.objects.get(dni=dni)
        if admin.contrasena == password: 
            return Response({
                'exito': True,
                'rol': 'admin',
                'usuario': {
                    'dni': admin.dni,
                    'nombre': admin.nombre,
                    'email': admin.email
                }
            }, status=status.HTTP_200_OK)
    except Administrador.DoesNotExist:
        pass 

    # 2. BUSCAR EN JUGADORES
    try:
        jugador = Jugador.objects.get(dni=dni)
        
        if jugador.baja:
             return Response({'error': 'Usuario dado de baja. Contacte con soporte.'}, status=status.HTTP_403_FORBIDDEN)

        if jugador.contrasena == password:
            return Response({
                'exito': True,
                'rol': 'jugador',
                'usuario': {
                    'dni': jugador.dni,
                    'nombre': jugador.nombre,
                    'email': jugador.email,
                    'cartera_monetaria': jugador.cartera_monetaria
                }
            }, status=status.HTTP_200_OK)
    except Jugador.DoesNotExist:
        pass

    return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)