from django.db import migrations
import os

def load_sql_from_file(filename):
    # Construct absolute path to the sql directory
    migration_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(migration_dir)
    sql_dir = os.path.join(app_dir, 'sql')
    file_path = os.path.join(sql_dir, filename)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Split by the slash delimiter on its own line (standard for Oracle PL/SQL)
    # We filter out empty statements
    import re
    # The regex looks for a newline, followed by a forward slash, followed by optional whitespace and end of line/string
    statements = re.split(r'\n/\s*(?:\n|$)', content)
    statements = [stmt.strip() for stmt in statements if stmt.strip()]
    return statements

class Migration(migrations.Migration):

    dependencies = [
        ('transacciones', '0001_initial'),
    ]

    operations = [
        # Triggers generales (validaciones de transacciones)
        migrations.RunSQL(
            sql=load_sql_from_file('triggers.sql'),
            reverse_sql="DROP TRIGGER TRG_CHECK_CANTIDAD_TRANSACCION; DROP TRIGGER TRG_CHECK_SALDO_RETIRO; DROP TRIGGER TRG_CHECK_SALDO_TRANSFERENCIA; DROP TRIGGER TRG_CHECK_DEPOSITO_MAX;"
        ),
        # Triggers de apuestas (MOVIDO A 0004 POR REFACTORIZACION DE TABLA)
        # migrations.RunSQL(
        #     sql=load_sql_from_file('triggers_apuestas.sql'),
        #     reverse_sql="DROP TRIGGER TRG_CHECK_CANTIDAD_APUESTA; DROP TRIGGER TRG_CHECK_SALDO_APUESTA; DROP TRIGGER TRG_CHECK_RANGO_APUESTA;"
        # ),
    ]
