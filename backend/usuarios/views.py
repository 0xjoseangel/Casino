from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Jugador
from .serializers import JugadorSerializer

class JugadorViewSet(viewsets.ModelViewSet):
    queryset = Jugador.objects.filter(baja=False) # Solo listamos los activos [cite: 109, 114]
    serializer_class = JugadorSerializer

    # RF1.2: Baja de jugador [cite: 94]
    @action(detail=True, methods=['post'])
    def solicitar_baja(self, request, pk=None):
        jugador = self.get_object()
        password = request.data.get('contrasena')
        codigo_confirmacion = request.data.get('mensaje_confirmacion')

        # RS1.2.1 y RS1.2.2: Validaciones de seguridad para baja [cite: 105, 106]
        if jugador.contrasena == password and codigo_confirmacion == "ELIMINAR":
            jugador.baja = True # Marcamos como baja [cite: 103]
            jugador.save()
            return Response({'message': 'Baja realizada correctamente'}, status=status.HTTP_200_OK)
        return Response({'error': 'Credenciales o código incorrectos'}, status=status.HTTP_400_BAD_REQUEST)