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

    # Relaciones (Usamos strings para evitar ciclos con la app 'usuarios')
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

    # Campo 'Resultado' mencionado en PDF (Tabla 12), lo interpretamos como estado
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='COMPLETADO')

    # Datos extra para RF3.1 y RF3.2 (Tarjeta de crédito)
    metodo_pago = models.CharField(max_length=50, blank=True, null=True, help_text="Ej: Tarjeta acabada en 1234")

    def __str__(self):
        return f"{self.tipo} - {self.usuario.dni} - {self.cantidad}€"

    class Meta:
        verbose_name = "Transacción Financiera"
        verbose_name_plural = "Transacciones Financieras"
        ordering = ['-fecha']


class Apuesta(models.Model):
    """
    Corresponde a la Tabla 7 (Juega) y cubre RF3.3 (Nueva Apuesta).
    Separamos esto porque tiene una lógica distinta vinculada a Juegos y Sesiones.
    """
    # Relaciones
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
    # Según Tabla 7, la apuesta se vincula a una Sesión
    # Si la app sesiones no está lista, esto podría dar error al migrar, 
    # pero es necesario según el diseño.
    sesion = models.ForeignKey(
        'sesiones.Sesion',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='apuestas_sesion'
    )

    fecha = models.DateTimeField(default=timezone.now)
    cantidad_apostada = models.DecimalField(max_digits=10, decimal_places=2)

    # 'Resultado' en Tabla 7: Cuánto ganó (o 0 si perdió)
    ganancia = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Campo auxiliar para saber si ganó o perdió
    resultado = models.CharField(max_length=20, blank=True, null=True) # Ej: "Victoria", "Derrota"

    def __str__(self):
        return f"Apuesta {self.juego.nombre} - {self.usuario.dni} - {self.cantidad_apostada}€"

    class Meta:
        verbose_name = "Apuesta (Juega)"
        verbose_name_plural = "Apuestas"
        ordering = ['-fecha']