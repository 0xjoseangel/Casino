import os
import oracledb
from dotenv import load_dotenv

load_dotenv()

dsn = f"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}"

try:
    connection = oracledb.connect(
        user=os.getenv('ORACLE_USER'),
        password=os.getenv('ORACLE_PASSWORD'),
        dsn=dsn
    )
    cursor = connection.cursor()

    print("--- TABLAS ---")
    cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
    tables = cursor.fetchall()
    for row in tables:
        print(f"TABLA: {row[0]}")
        cursor.execute(f"SELECT column_name, data_type FROM user_tab_columns WHERE table_name = '{row[0]}'")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]} ({col[1]})")

    connection.close()

except Exception as e:
    print(f"ERROR: {e}")
