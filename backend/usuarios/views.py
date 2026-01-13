from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Jugador, Administrador
from .serializers import JugadorSerializer, AdministradorSerializer


class JugadorViewSet(viewsets.ModelViewSet):
    # Mostramos todos (activos y bajas) para que el admin pueda gestionar
    queryset = Jugador.objects.all()
    serializer_class = JugadorSerializer
    permission_classes = [AllowAny]

    #RF1.1: Registro de jugador -> Override create
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        # RDS1.1.1: Mensaje de confirmación
        return Response(
            {'mensaje': 'Jugador registrado correctamente en el sistema'}, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

    # RF1.2: Baja de jugador
    @action(detail=True, methods=['post'])
    def baja_jugador(self, request, pk=None):
        jugador = self.get_object()
        password = request.data.get('contrasena')
        codigo_confirmacion = request.data.get('mensaje_confirmacion')

        # RS1.2.1 y RS1.2.2: Validaciones de seguridad para baja
        if jugador.contrasena == password and codigo_confirmacion == "ELIMINAR":
            jugador.baja = True
            jugador.save()
            return Response({'message': 'Baja realizada correctamente'}, status=status.HTTP_200_OK)
        return Response({'error': 'Credenciales o código incorrectos'}, status=status.HTTP_400_BAD_REQUEST)

class AdministradorViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.filter(baja=False)
    serializer_class = AdministradorSerializer
    
# LOGIN UNIFICADO (JUGADORES Y ADMINS)
@api_view(['POST'])
@permission_classes([AllowAny]) # Permitimos entrar a cualquiera para intentar loguearse
def login_view(request):
    dni = request.data.get('dni')
    password = request.data.get('contrasena') # O 'password', según mande el front

    if not dni or not password:
        return Response({'error': 'Faltan credenciales'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. BUSCAR EN ADMINISTRADORES
    try:
        admin = Administrador.objects.get(dni=dni)
        if admin.contrasena == password: # Nota: En producción usaríamos hash, para la práctica vale texto plano
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
        pass # No es admin, seguimos buscando

    # 2. BUSCAR EN JUGADORES
    try:
        jugador = Jugador.objects.get(dni=dni)
        
        # Validar si está dado de baja
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

    # SI LLEGAMOS AQUÍ, NO EXISTE O CONTRASEÑA MAL
    return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)