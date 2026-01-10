from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Jugador
from .serializers import JugadorSerializer

class JugadorViewSet(viewsets.ModelViewSet):
    queryset = Jugador.objects.filter(baja=False)
    serializer_class = JugadorSerializer

    #RF1.1: Registro de jugador
    def registro_jugador(self, request, *args, **kwargs):
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