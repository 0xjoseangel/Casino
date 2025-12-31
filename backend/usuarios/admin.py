from django.contrib import admin
from .models import Jugador, Administrador

@admin.register(Jugador)
class JugadorAdmin(admin.ModelAdmin):
    list_display = ('dni', 'nombre', 'apellidos', 'email', 'cartera_monetaria', 'baja')
    list_filter = ('baja',)
    search_fields = ('dni', 'email')

@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    list_display = ('dni', 'nombre', 'email', 'baja')
    search_fields = ('dni', 'email')