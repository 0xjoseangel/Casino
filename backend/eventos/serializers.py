from rest_framework import serializers
from .models import Promocion, Torneo, Participa, Compite

class PromocionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promocion
        fields = '__all__'

class TorneoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Torneo
        fields = '__all__'

# Serializers para las tablas intermedias (Inscripciones)
class ParticipaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participa
        fields = '__all__'

class CompiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compite
        fields = '__all__'