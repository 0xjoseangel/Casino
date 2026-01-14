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
    cursor.execute("SELECT trigger_name, table_name, status FROM user_triggers ORDER BY trigger_name")
    print("--- TRIGGERS ---")
    triggers = cursor.fetchall()
    if not triggers:
        print("No triggers found.")
    for row in triggers:
        print(f"Trigger: {row[0]} | Table: {row[1]} | Status: {row[2]}")
    connection.close()
except Exception as e:
    print(f"Error: {e}")
