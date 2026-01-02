from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PromocionViewSet, TorneoViewSet, 
    ParticipaViewSet, CompiteViewSet
)

router = DefaultRouter()
router.register(r'promociones', PromocionViewSet)
router.register(r'torneos', TorneoViewSet)
router.register(r'participaciones', ParticipaViewSet) # Para apuntarse a promos
router.register(r'competiciones', CompiteViewSet)     # Para apuntarse a torneos

urlpatterns = [
    path('', include(router.urls)),
]