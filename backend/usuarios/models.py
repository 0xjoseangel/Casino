from django.db import models

class Jugador(models.Model):
    # DNI como clave primaria (Cadena de 9) [cite: 81, 1306]
    dni = models.CharField(max_length=9, primary_key=True)
    nombre = models.CharField(max_length=20) # [cite: 79]
    apellidos = models.CharField(max_length=20) # [cite: 80]
    email = models.EmailField(max_length=30, unique=True) # [cite: 85, 93]
    direccion = models.CharField(max_length=50) # [cite: 83]
    telefono = models.IntegerField() # [cite: 84] (Validación de 9 dígitos en Serializer)
    fecha_nacimiento = models.DateField() # [cite: 82]
    contrasena = models.CharField(max_length=20) # [cite: 86]
    cartera_monetaria = models.IntegerField() # [cite: 87, 1306]
    baja = models.BooleanField(default=False) # [cite: 87, 1306]

    class Meta:
        db_table = 'JUGADOR' # [cite: 1306]

class Administrador(models.Model):
    dni = models.CharField(max_length=9, primary_key=True) # [cite: 1311]
    nombre = models.CharField(max_length=20)
    apellidos = models.CharField(max_length=20)
    email = models.EmailField(max_length=30, unique=True)
    direccion = models.CharField(max_length=50)
    telefono = models.IntegerField()
    fecha_nacimiento = models.DateField()
    contrasena = models.CharField(max_length=20)
    baja = models.BooleanField(default=False)

    class Meta:
        db_table = 'ADMINISTRADOR' # [cite: 1311]