from django.contrib import admin

from .models import Promocion, Torneo, Participa, Compite

# Esto hace que aparezcan en la web que me has enseñado
admin.site.register(Promocion)
admin.site.register(Torneo)
admin.site.register(Participa)
admin.site.register(Compite)
