from django.db import migrations
import os

def load_sql_from_file(filename):
    migration_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(migration_dir)
    sql_dir = os.path.join(app_dir, 'sql')
    file_path = os.path.join(sql_dir, filename)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    import re
    statements = re.split(r'\n/\s*(?:\n|$)', content)
    statements = [stmt.strip() for stmt in statements if stmt.strip()]
    return statements

class Migration(migrations.Migration):

    dependencies = [
        ('transacciones', '0003_rename_apuesta_juega_alter_juega_options_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            sql=load_sql_from_file('triggers_apuestas.sql'),
            # No reverse SQL needed for now or can use the drop statements
            reverse_sql="DROP TRIGGER TRG_CHECK_CANTIDAD_APUESTA; DROP TRIGGER TRG_CHECK_SALDO_APUESTA; DROP TRIGGER TRG_CHECK_RANGO_APUESTA; DROP TRIGGER TRG_CHECK_SESION_REQUERIDA;"
        ),
    ]
