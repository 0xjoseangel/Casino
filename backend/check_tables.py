import os
import oracledb
from pathlib import Path

# Load .env manually since we can't use 'dotenv' library if not installed in the env we run in?
# But we can try to parse it manually to be safe and dependency-free (except oracledb)
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
    cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
    print("--- TABLES ---")
    for row in cursor:
        print(row[0])
    connection.close()
except Exception as e:
    print(f"Error: {e}")
