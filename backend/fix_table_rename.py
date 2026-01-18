import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "casino_project.settings")
django.setup()
from django.db import connection

def rename_table():
    with connection.cursor() as cursor:
        try:
            print("Attempting to rename JUEGOS_JUEGO to JUEGO...")
            cursor.execute("ALTER TABLE JUEGOS_JUEGO RENAME TO JUEGO")
            print("Successfully renamed table.")
        except Exception as e:
            print(f"Error renaming table: {e}")
            
if __name__ == "__main__":
    rename_table()
