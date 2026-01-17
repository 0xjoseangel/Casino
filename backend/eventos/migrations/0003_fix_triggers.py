from django.db import migrations
import os


def load_sql_from_file(filename):
    """Carga y parsea un archivo SQL con triggers PL/SQL de Oracle."""
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
        ('eventos', '0002_add_triggers'),
    ]

    operations = [
        # Re-aplicar triggers corregidos (CREATE OR REPLACE los sobrescribe)
        migrations.RunSQL(
            sql=load_sql_from_file('triggers.sql'),
            reverse_sql=migrations.RunSQL.noop
        ),
    ]
