from django.db import migrations
import os
import re

def load_sql_from_file(filename):
    migration_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(migration_dir)
    sql_dir = os.path.join(app_dir, 'sql')
    file_path = os.path.join(sql_dir, filename)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    statements = re.split(r'\n/\s*(?:\n|$)', content)
    statements = [stmt.strip() for stmt in statements if stmt.strip()]
    return statements

class Migration(migrations.Migration):

    dependencies = [
        ('juegos', '0003_alter_juego_tipo'),
    ]

    operations = [
        migrations.RunSQL(
            sql=load_sql_from_file('juegos_triggers.sql'),
            reverse_sql="DROP TRIGGER TR_VALIDAR_APUESTAS"
        ),
    ]
