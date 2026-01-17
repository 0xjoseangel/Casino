from django.contrib import admin

# Register your models here.

from .models import Transaccion, Juega

# Esto hace que aparezcan en la web que me has enseñado
admin.site.register(Transaccion)
admin.site.register(Juega)