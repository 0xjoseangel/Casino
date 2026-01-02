from django.contrib import admin
from .models import Juego

@admin.register(Juego)
class JuegoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'apuesta_minima', 'apuesta_maxima', 'estado')
    list_filter = ('tipo', 'estado')
    search_fields = ('nombre',)
    list_editable = ('estado',)
