from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JuegoViewSet

router = DefaultRouter()

router.register(r'juegos', JuegoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]