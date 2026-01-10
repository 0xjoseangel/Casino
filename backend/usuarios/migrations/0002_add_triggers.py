from django.db import migrations
import os

def load_sql_file(file_name):
    # Search for the sql folder at the project root level
    file_path = os.path.join(os.path.dirname(__file__), '../sql', file_name)
    
    with open(file_path, 'r') as file:
        content = file.read()
        
        commands = content.split('\n/\n')

        clean_commands = [cmd.strip() for cmd in commands if cmd.strip()]
        return clean_commands

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(load_sql_file('triggers.sql')),
    ]
