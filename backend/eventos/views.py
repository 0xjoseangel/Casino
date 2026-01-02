from rest_framework import viewsets
from .models import Promocion, Torneo, Participa, Compite
from .serializers import (
    PromocionSerializer, TorneoSerializer, 
    ParticipaSerializer, CompiteSerializer
)

class PromocionViewSet(viewsets.ModelViewSet):
    queryset = Promocion.objects.all()
    serializer_class = PromocionSerializer

class TorneoViewSet(viewsets.ModelViewSet):
    queryset = Torneo.objects.all()
    serializer_class = TorneoSerializer

class ParticipaViewSet(viewsets.ModelViewSet):
    queryset = Participa.objects.all()
    serializer_class = ParticipaSerializer

class CompiteViewSet(viewsets.ModelViewSet):
    queryset = Compite.objects.all()
    serializer_class = CompiteSerializer