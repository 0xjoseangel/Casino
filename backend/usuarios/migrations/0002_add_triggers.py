from django.db import migrations
import os

def load_sql_file(file_name):
    # Search for the sql folder at the project root level
    file_path = os.path.join(os.path.dirname(__file__), '../sql', file_name)
    
    with open(file_path, 'r') as file:
        content = file.read()
        

        # Split by / on its own line, handling potential whitespace
        commands = []
        current_command = []
        for line in content.splitlines():
            if line.strip() == '/':
                if current_command:
                    commands.append('\n'.join(current_command))
                    current_command = []
            else:
                current_command.append(line)
        if current_command:
            commands.append('\n'.join(current_command))
        
        # Ensure cmds end with ; and have a trailing newline to prevent driver stripping
        final_commands = []
        for cmd in commands:
            if not cmd.strip(): continue
            cleaned = cmd.strip()
            if not cleaned.endswith(';'):
                cleaned += ';'
            final_commands.append(cleaned)
        return final_commands

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql=load_sql_file('triggers.sql'),
            reverse_sql=migrations.RunSQL.noop  # Or provide DROP TRIGGER commands if desired
        ),
    ]
