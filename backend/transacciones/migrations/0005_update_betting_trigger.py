from django.db import migrations
import os

def load_sql_from_file(filename):
    file_path = os.path.join(os.path.dirname(__file__), '..', 'sql', filename)
    with open(file_path, 'r') as f:
        return f.read()

class Migration(migrations.Migration):

    dependencies = [
        ('transacciones', '0004_reapply_triggers'),
    ]

    operations = [
        migrations.RunSQL(
            sql=[
                statement.strip() 
                for statement in load_sql_from_file('triggers_apuestas.sql').split('/') 
                if statement.strip()
            ],
            # No reverse SQL needed for now
            reverse_sql=""
        ),
    ]
