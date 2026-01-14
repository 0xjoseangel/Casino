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
    
    # Check source for one specific trigger
    trigger_name = 'TRG_CHECK_DEPOSITO_MAX'
    print(f"--- SOURCE FOR {trigger_name} ---")
    cursor.execute("SELECT line, text FROM user_source WHERE name = :name ORDER BY line", name=trigger_name)
    
    rows = cursor.fetchall()
    if not rows:
        print("No source code found.")
    for row in rows:
        print(f"{row[0]}: {row[1].rstrip()}")
        
    connection.close()
except Exception as e:
    print(f"Error: {e}")
