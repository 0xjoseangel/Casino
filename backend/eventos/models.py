from django.db import models
from django.utils import timezone

class Promocion(models.Model):
    """
    Gestión de bonos y ofertas.
    """
    TIPO_CHOICES = [
        ('Bono de Bienvenida', 'Bono de Bienvenida'),
        ('Tiradas Gratis', 'Tiradas Gratis'),
        ('Cashback', 'Cashback'),
    ]

    # Usamos AutoField para el ID, Django lo gestiona solo
    nombre = models.CharField(max_length=50, unique=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    condiciones = models.TextField(verbose_name="Condiciones/Requisitos")
    # Beneficio es cadena (ej: "10%" o "20 euros")
    beneficio = models.CharField(max_length=20) 
    max_jugadores = models.PositiveIntegerField(default=0, help_text="0 para ilimitado")
    estado = models.BooleanField(default=False, help_text="Activo (True) / Inactivo (False)")
    fecha_activacion = models.DateField(null=True, blank=True)
    fecha_creacion = models.DateField(auto_now_add=True)

    # Relación N:M con Jugador 
    jugadores = models.ManyToManyField(
        'usuarios.Jugador', 
        through='Participa',
        related_name='promociones'
    )

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"

class Torneo(models.Model):
    """
    Competiciones asociadas a un juego.
    """
    ESTADO_CHOICES = [
        ('programado', 'Programado'),
        ('abierto', 'Abierto'),
        ('en curso', 'En curso'),
        ('finalizado', 'Finalizado'),
    ]

    nombre = models.CharField(max_length=50, unique=True)
    # Relación con el módulo de Minerva (Juegos)
    juego = models.ForeignKey('juegos.Juego', on_delete=models.CASCADE)
    fecha_inicio = models.DateField()
    hora_inicio = models.TimeField()
    aforo_maximo = models.PositiveIntegerField()
    precio_inscripcion = models.DecimalField(max_digits=10, decimal_places=2)
    reglas = models.TextField(verbose_name="Reglas/Condiciones")
    premio = models.CharField(max_length=50) # Ej: "1000€" o "Coche"
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='programado')

    # Relación N:M con Jugador
    participantes = models.ManyToManyField(
        'usuarios.Jugador',
        through='Compite',
        related_name='torneos'
    )

    def __str__(self):
        return f"Torneo: {self.nombre} - {self.get_estado_display()}"

# --- TABLAS INTERMEDIAS (Relaciones) ---

class Participa(models.Model):
    """
    Relación entre Jugador y Promoción.
    """
    jugador = models.ForeignKey('usuarios.Jugador', on_delete=models.CASCADE)
    promocion = models.ForeignKey(Promocion, on_delete=models.CASCADE)
    fecha_inscripcion = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('jugador', 'promocion')

class Compite(models.Model):
    """
    Relación entre Jugador y Torneo, incluyendo su posición final.
    """
    jugador = models.ForeignKey('usuarios.Jugador', on_delete=models.CASCADE)
    torneo = models.ForeignKey(Torneo, on_delete=models.CASCADE)
    # La posición puede ser nula al principio, se rellena al finalizar el torneo
    posicion = models.PositiveIntegerField(null=True, blank=True) 

    class Meta:
        unique_together = ('jugador', 'torneo')
