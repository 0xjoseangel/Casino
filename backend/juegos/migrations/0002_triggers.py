from django.db import migrations
from django.conf import settings
import os

def get_trigger_code():
    
    file_path = os.path.join(settings.BASE_DIR, 'juegos', 'sql', 'juegos_triggers.sql')
   
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read().strip()

class Migration(migrations.Migration):
    dependencies = [
        ('juegos', '0001_initial'),
    ]

    operations = [
        # Usamos directamente el string del archivo
        migrations.RunSQL(get_trigger_code()),
    ]