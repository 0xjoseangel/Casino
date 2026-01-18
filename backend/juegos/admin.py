from django.contrib import admin
from .models import Juego
from django.db.models import Sum

@admin.register(Juego)
class JuegoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'estado', 'rentabilidad_calculada')
    readonly_fields = ('rentabilidad_calculada',) # Importante: que sea solo lectura

    def rentabilidad_calculada(self, obj):
        stats = obj.apuestas_realizadas.aggregate(
            total_apostado=Sum('cantidad_apostada'),
            total_pagado=Sum('ganancia')
        )
        apostado = stats['total_apostado'] or 0
        pagado = stats['total_pagado'] or 0
        return f"{apostado - pagado} €"
    
    rentabilidad_calculada.short_description = 'Rentabilidad Actual'