from django.contrib import admin

from .models import Promocion, Torneo, Participa, Compite

admin.site.register(Promocion)
admin.site.register(Torneo)
admin.site.register(Participa)
admin.site.register(Compite)
