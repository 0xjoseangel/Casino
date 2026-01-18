from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.db.models import Sum

class Juego(models.Model):
   
    nombre = models.CharField(max_length=40, unique=True)
    class Meta:
        db_table = 'JUEGO' 
        verbose_name = 'Juego'
        verbose_name_plural = 'Juegos'
    TIPO_CHOICES = [
        ('tragaperras', 'Tragaperras'),
        ('ruleta', 'Ruleta'),
        ('cartas', 'Cartas'),
    ]
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)

    # Añadimos MinValueValidator para validación en formularios/admin
    apuesta_minima = models.FloatField(validators=[MinValueValidator(0.01)])
    apuesta_maxima = models.FloatField(validators=[MinValueValidator(0.01)])

    estado = models.BooleanField(default=True, help_text="Activo/Inactivo")
    descripcion = models.CharField(max_length=200)

    @property
    def rentabilidad(self):
        # Sumamos todas las apuestas y todas las ganancias de este juego
        stats = self.apuestas_realizadas.aggregate(
            total_apostado=Sum('cantidad_apostada'),
            total_pagado=Sum('ganancia')
        )
        
        apostado = stats['total_apostado'] or 0
        pagado = stats['total_pagado'] or 0
        
        # El beneficio del casino es lo que se quedó
        return apostado - pagado
    def clean(self):
       
        if self.apuesta_minima > self.apuesta_maxima:
            raise ValidationError("La apuesta mínima no puede ser mayor que la máxima.")

    def __str__(self):
        return self.nombre
