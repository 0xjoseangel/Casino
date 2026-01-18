import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

def check_tables():
    with connection.cursor() as cursor:
        # Oracle specific query to list tables for current user
        cursor.execute("SELECT table_name FROM user_tables")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"Found tables: {tables}")
        
        if "JUEGO" in tables:
            print("Table 'JUEGO' exists.")
        else:
            print("Table 'JUEGO' does NOT exist.")
            
        if "juegos_juego" in tables: # Django lowercases? Oracle uppercases usually?
            # Oracle stores unquoted names as UPPERCASE.
            # Django default table name "juegos_juego" -> quoted -> "juegos_juego".
            # If created without quotes, it would be JUEGOS_JUEGO.
            pass
            
        # Check specific variants
        variants = ["juegos_juego", "JUEGOS_JUEGO", "JUEGO", "juego"]
        for v in variants:
            if v in tables:
                print(f"Match found: {v}")
                
        # Also Check quoted exact matches if possible (user_tables stores correct case?)
        # user_tables stores straightforward names. Quoted lowercase names are stored as is?
        # Let's inspect the output.

if __name__ == "__main__":
    check_tables()
