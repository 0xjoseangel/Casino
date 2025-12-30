# from django.db import models
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta

# class Sesion(models.Model):
#     # Relación con el Jugador (Usuario)
#     usuario = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name='sesiones',
#         db_column='DNI_JUGADOR'  # Mapeo al campo DNI del diseño 
#     )

#     # Datos de inicio [cite: 1960]
#     fecha_actual = models.DateField(auto_now_add=True)
#     hora_inicio = models.TimeField(auto_now_add=True)
#     saldo_inicio = models.DecimalField(max_digits=10, decimal_places=2)

#     # Reglas de Juego Responsable [cite: 1964, 1965]
#     regla1_limite_gasto_diario = models.DecimalField(
#         max_digits=10, 
#         decimal_places=2, 
#         default=0,
#         help_text="Límite de gasto diario establecido para esta sesión"
#     )
#     regla2_limite_operaciones_hora = models.IntegerField(
#         default=0,
#         help_text="Límite de operaciones por hora"
#     )

#     # Datos de fin [cite: 1986]
#     saldo_final = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     hora_fin = models.TimeField(null=True, blank=True)
#     duracion_sesion = models.DurationField(null=True, blank=True)
    
#     # Estado para control interno (Activa/Cerrada)
#     activa = models.BooleanField(default=True)

#     class Meta:
#         db_table = 'SESION'
#         ordering = ['-fecha_actual', '-hora_inicio']
#         # Validamos que no se solapen sesiones activas lógicamente en views,
#         # pero aquí definimos la estructura física.

#     def finalizar_sesion(self, saldo_actual):
#         """
#         Cierra la sesión calculando tiempos y balances según RF5.2[cite: 1980].
#         """
#         now = timezone.now()
#         self.hora_fin = now.time()
#         self.saldo_final = saldo_actual
#         self.activa = False
        
#         # Cálculo de duración aproximada
#         # Nota: En un entorno real sumaríamos fecha+hora para delta preciso.
#         start_dt = timezone.datetime.combine(self.fecha_actual, self.hora_inicio)
#         end_dt = timezone.datetime.combine(now.date(), self.hora_fin)
#         self.duracion_sesion = end_dt - start_dt
        
#         self.save()

#     def obtener_balance(self):
#         """
#         RF5.3: Calcular ganancias o pérdidas[cite: 2007].
#         """
#         if self.saldo_final is None:
#             return 0 # O calcular contra saldo actual en tiempo real
#         return self.saldo_final - self.saldo_inicio

#     def __str__(self):
#         return f"Sesión {self.id} - {self.usuario} ({self.fecha_actual})"