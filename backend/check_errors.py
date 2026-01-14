import os
import oracledb
from pathlib import Path

# Manual .env loading
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    with open(env_path, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                try:
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
                except ValueError:
                    pass

print("Connecting to Oracle...")
dsn = f"{os.environ.get('ORACLE_HOST')}:{os.environ.get('ORACLE_PORT')}/{os.environ.get('ORACLE_SERVICE_NAME')}"
user = os.environ.get('ORACLE_USER')
password = os.environ.get('ORACLE_PASSWORD')

try:
    connection = oracledb.connect(
        user=user,
        password=password,
        dsn=dsn
    )
    cursor = connection.cursor()
    
    print("--- TRIGGER ERRORS ---")
    cursor.execute("""
        SELECT name, type, line, position, text 
        FROM user_errors 
        WHERE type = 'TRIGGER' 
        ORDER BY name, sequence
    """)
    
    errors = cursor.fetchall()
    if not errors:
        print("No compilation errors found.")
    for row in errors:
        print(f"Trigger: {row[0]} | Line: {row[2]} | Error: {row[4]}")
        
    connection.close()
except Exception as e:
    print(f"Error: {e}")
