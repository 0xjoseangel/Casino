from django.db import models
from django.utils import timezone

class Transaccion(models.Model):
    """
    Corresponde a la Tabla 12 del PDF y cubre RF3.1, RF3.2, RF3.4, RF3.5.
    Gestiona el flujo de dinero 'externo' o entre usuarios.
    """
    TIPO_CHOICES = [
        ('DEPOSITO', 'Depósito'),
        ('RETIRO', 'Retiro'),
        ('TRANSFERENCIA', 'Transferencia'),
    ]

    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADO', 'Completado'),
        ('RECHAZADO', 'Rechazado'),
    ]

    usuario = models.ForeignKey(
        'usuarios.Jugador', 
        on_delete=models.CASCADE, 
        related_name='transacciones_origen',
        verbose_name="Jugador Origen"
    )

    # Solo para transferencias (RF3.5) - DNI_Jugador2 en el PDF
    destinatario = models.ForeignKey(
        'usuarios.Jugador', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='transacciones_destino',
        verbose_name="Jugador Destino"
    )

    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(default=timezone.now)

    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='COMPLETADO')

    metodo_pago = models.CharField(max_length=50, blank=True, null=True, help_text="Ej: Tarjeta acabada en 1234")

    def __str__(self):
        return f"{self.tipo} - {self.usuario.dni} - {self.cantidad}€"

    class Meta:
        verbose_name = "Transacción Financiera"
        verbose_name_plural = "Transacciones Financieras"
        ordering = ['-fecha']


class Juega(models.Model):
    """
    Corresponde a la Tabla 7 (Juega) y cubre RF3.3 (Nueva Apuesta).
    Separamos esto porque tiene una lógica distinta vinculada a Juegos y Sesiones.
    """
    usuario = models.ForeignKey(
        'usuarios.Jugador', 
        on_delete=models.CASCADE,
        related_name='apuestas'
    )
    juego = models.ForeignKey(
        'juegos.Juego', 
        on_delete=models.CASCADE, 
        related_name='apuestas_realizadas'
    )

    sesion = models.ForeignKey(
        'sesiones.Sesion',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='apuestas_sesion'
    )

    fecha = models.DateTimeField(default=timezone.now)
    cantidad_apostada = models.DecimalField(max_digits=10, decimal_places=2)

    ganancia = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    resultado = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Apuesta {self.juego.nombre} - {self.usuario.dni} - {self.cantidad_apostada}€"

    class Meta:
        db_table = 'JUEGA'
        verbose_name = "Juega"
        verbose_name_plural = "Juega"
        ordering = ['-fecha']