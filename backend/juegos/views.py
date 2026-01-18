from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from .models import Juego
from .serializers import JuegoSerializer

class JuegoViewSet(viewsets.ModelViewSet):
    queryset = Juego.objects.all()
    serializer_class = JuegoSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
       
        if self.action != 'list':
            return Juego.objects.all()
            
        es_admin = self.request.query_params.get('admin', None)
        if es_admin:
            return Juego.objects.all()
            
        return Juego.objects.filter(estado=True)

    @action(detail=True, methods=['post'])
    def deshabilitar(self, request, pk=None):
        juego = self.get_object()
        
        if not juego.estado:
            return Response({'message': 'El juego ya está inactivo'}, status=status.HTTP_400_BAD_REQUEST)

        juego.estado = False  
        juego.save()
        return Response({'message': 'Juego deshabilitado correctamente'}, status=status.HTTP_200_OK)
