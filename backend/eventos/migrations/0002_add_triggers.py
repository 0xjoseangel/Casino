from django.db import migrations
import os


def load_sql_from_file(filename):
    """Carga y parsea un archivo SQL con triggers PL/SQL de Oracle."""
    # Construir path absoluto al directorio sql
    migration_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.dirname(migration_dir)
    sql_dir = os.path.join(app_dir, 'sql')
    file_path = os.path.join(sql_dir, filename)

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Dividir por el delimitador / de Oracle PL/SQL
    import re
    statements = re.split(r'\n/\s*(?:\n|$)', content)
    statements = [stmt.strip() for stmt in statements if stmt.strip()]
    return statements


class Migration(migrations.Migration):

    dependencies = [
        ('eventos', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=load_sql_from_file('triggers.sql'),
            reverse_sql="""
                DROP TRIGGER TRG_CHECK_FECHAS_PROMOCION;
                DROP TRIGGER TRG_CHECK_MAX_JUGADORES_PROMOCION;
                DROP TRIGGER TRG_CHECK_PRECIO_TORNEO;
                DROP TRIGGER TRG_CHECK_AFORO_TORNEO;
                DROP TRIGGER TRG_CHECK_ESTADO_TORNEO;
                DROP TRIGGER TRG_PROTEGER_TORNEO_FINALIZADO;
                DROP TRIGGER TRG_CHECK_PROMOCION_ACTIVA;
                DROP TRIGGER TRG_CHECK_AFORO_PROMOCION;
                DROP TRIGGER TRG_CHECK_TORNEO_ABIERTO;
                DROP TRIGGER TRG_CHECK_AFORO_COMPITE;
                DROP TRIGGER TRG_CHECK_POSICION_TORNEO;
            """
        ),
    ]
