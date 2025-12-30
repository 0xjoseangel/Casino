# from django.db import models

# class Juego(models.Model):
#     """
#     Módulo de Juegos - Requisitos de Minerva Cebrián Marín (Sección 3.2)
#     """
    
#     # Nombre del juego: Cadena de caracteres (40) 
#     # RS2.1.1: Debe ser único en el sistema 
#     nombre = models.CharField(max_length=40, unique=True)
    
#     # Tipo de juego: Cadena de caracteres (20) (tragaperras, ruleta) 
#     TIPO_CHOICES = [
#         ('tragaperras', 'Tragaperras'),
#         ('ruleta', 'Ruleta'),
#     ]
#     tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    
#     # Apuesta mínima: Float (5) 
#     apuesta_minima = models.FloatField()
    
#     # Apuesta máxima: Float (5) 
#     apuesta_maxima = models.FloatField()
    
#     # Estado inicial: Booleano (Activo/Inactivo) [cite: 85, 89]
#     # Se usa para RF2.2: Deshabilitar juego [cite: 90]
#     estado = models.BooleanField(default=True, help_text="Activo/Inactivo")
    
#     # Descripción/Reglas: Cadena de caracteres (200) 
#     descripcion = models.CharField(max_length=200)

#     def __str__(self):
#         return self.nombre