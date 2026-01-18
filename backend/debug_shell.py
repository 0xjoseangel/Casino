from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT table_name FROM user_tables")
    print(f"DEBUG_TABLES: {[row[0] for row in cursor.fetchall()]}")
