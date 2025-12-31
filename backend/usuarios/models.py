from django.db import models

class Jugador(models.Model):
    dni = models.CharField(max_length=9, primary_key=True)
    nombre = models.CharField(max_length=20) 
    apellidos = models.CharField(max_length=20) 
    email = models.EmailField(max_length=30, unique=True)
    direccion = models.CharField(max_length=50)
    telefono = models.IntegerField()
    fecha_nacimiento = models.DateField() 
    contrasena = models.CharField(max_length=20)
    cartera_monetaria = models.IntegerField() 
    baja = models.BooleanField(default=False) 

    class Meta:
        db_table = 'JUGADOR' 
        verbose_name = 'Jugador'
        verbose_name_plural = 'Jugadores'

class Administrador(models.Model):
    dni = models.CharField(max_length=9, primary_key=True) 
    nombre = models.CharField(max_length=20)
    apellidos = models.CharField(max_length=20)
    email = models.EmailField(max_length=30, unique=True)
    direccion = models.CharField(max_length=50)
    telefono = models.IntegerField()
    fecha_nacimiento = models.DateField()
    contrasena = models.CharField(max_length=20)
    baja = models.BooleanField(default=False)

    class Meta:
        db_table = 'ADMINISTRADOR' 
        verbose_name = 'Administrador'
        verbose_name_plural = 'Administradores'