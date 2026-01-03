from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Sesion
from .serializers import (
    IniciarSesionSerializer, 
    FinalizarSesionSerializer, 
    BalanceSesionSerializer,
    ModificarSeguridadSerializer
)

# RF5.1: Comenzar Sesión [cite: 1954]
class IniciarSesionView(generics.CreateAPIView):
    serializer_class = IniciarSesionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Asignamos el usuario actual automáticamente
        serializer.save(usuario=self.request.user)

# RF5.2: Finalizar Sesión [cite: 1980]
class FinalizarSesionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # RS5.2.2: Debe existir sesión activa [cite: 1995]
        sesion = get_object_or_404(Sesion, usuario=request.user, activa=True)
        
        serializer = FinalizarSesionSerializer(data=request.data)
        if serializer.is_valid():
            # Ejecutamos la lógica de cierre definida en el modelo
            sesion.finalizar_sesion(serializer.validated_data['saldo_final'])
            
            return Response({
                "mensaje": "Sesión finalizada correctamente", # [cite: 1992]
                "duracion": str(sesion.duracion_sesion),
                "saldo_final": sesion.saldo_final
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# RF5.3: Obtener Balance de Sesión [cite: 1996]
class BalanceSesionView(generics.RetrieveAPIView):
    serializer_class = BalanceSesionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # RS5.3.1: Solo se consulta si existe sesión activa (o la última recién cerrada) [cite: 2008]
        # Nota: Adaptamos para devolver la última sesión del usuario
        return Sesion.objects.filter(usuario=self.request.user).latest('id')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Calculamos el beneficio/pérdida en tiempo de ejecución
        saldo_fin = instance.saldo_final if instance.saldo_final is not None else instance.saldo_inicio 
        # (Si está activa, el "final" temporal es el actual, aquí simplificado al inicio)
        
        data['beneficio_perdida'] = saldo_fin - instance.saldo_inicio
        return Response(data)

# RF5.5: Modificar criterios de seguridad [cite: 2024]
class ModificarSeguridadView(generics.UpdateAPIView):
    queryset = Sesion.objects.all()
    serializer_class = ModificarSeguridadSerializer
    permission_classes = [permissions.IsAdminUser] # Solo Admin [cite: 2026]
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        response.data['mensaje'] = "Criterios de seguridad actualizados"
        return response