from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError

class Juego(models.Model):
    # ... (nombre y tipo se mantienen igual)
    nombre = models.CharField(max_length=40, unique=True)
    
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

    def clean(self):
       
        if self.apuesta_minima > self.apuesta_maxima:
            raise ValidationError("La apuesta mínima no puede ser mayor que la máxima.")

    def __str__(self):
        return self.nombre
