from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Juego
from .serializers import JuegoSerializer

class JuegoViewSet(viewsets.ModelViewSet):
    
    # RF2.5: Consultar catálogo de juegos
    # "Solo se listarán juegos cuyo Estado sea Activo"
    queryset = Juego.objects.filter(estado=True)
    serializer_class = JuegoSerializer

    # RF2.2: Deshabilitar juego
    # A diferencia del Jugador, aquí no pedimos password porque lo hace un administrador logueado
    @action(detail=True, methods=['post'])
    def deshabilitar(self, request, pk=None):
        juego = self.get_object()
        
        if not juego.estado:
            return Response({'message': 'El juego ya está inactivo'}, status=status.HTTP_400_BAD_REQUEST)

        juego.estado = False  # Cambiamos el estado a Inactivo
        juego.save()
        return Response({'message': 'Juego deshabilitado correctamente'}, status=status.HTTP_200_OK)