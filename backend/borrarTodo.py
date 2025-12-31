import os
import oracledb
from dotenv import load_dotenv

# 1. Cargar variables de entorno
load_dotenv()

print("☢️  INICIANDO PROTOCOLO DE LIMPIEZA DE ORACLE ☢️")
print(f"Usuario: {os.getenv('ORACLE_USER')}")
print("---")

# 2. Configurar conexión (Igual que en settings.py)
dsn = f"{os.getenv('ORACLE_HOST')}:{os.getenv('ORACLE_PORT')}/{os.getenv('ORACLE_SERVICE_NAME')}"

try:
    connection = oracledb.connect(
        user=os.getenv('ORACLE_USER'),
        password=os.getenv('ORACLE_PASSWORD'),
        dsn=dsn
    )
    cursor = connection.cursor()

    # --- FASE 1: BORRAR TABLAS ---
    print("\n[1/2] Buscando tablas existentes...")
    cursor.execute("SELECT table_name FROM user_tables")
    tablas = cursor.fetchall()

    if not tablas:
        print("   ✅ No hay tablas para borrar.")
    else:
        for tabla in tablas:
            nombre_tabla = tabla[0]
            # No borramos tablas de sistema si aparecieran, solo las del usuario
            try:
                # CASCADE CONSTRAINTS: Rompe relaciones FK
                # PURGE: Borra definitivamente (sin papelera) para no llenar la cuota de la uni
                sql = f"DROP TABLE {nombre_tabla} CASCADE CONSTRAINTS PURGE"
                cursor.execute(sql)
                print(f"   🗑️  Tabla eliminada: {nombre_tabla}")
            except Exception as e:
                print(f"   ❌ Error borrando {nombre_tabla}: {e}")

    # --- FASE 2: BORRAR SECUENCIAS (Django las usa para los IDs) ---
    print("\n[2/2] Buscando secuencias...")
    cursor.execute("SELECT sequence_name FROM user_sequences")
    secuencias = cursor.fetchall()

    if not secuencias:
        print("   ✅ No hay secuencias para borrar.")
    else:
        for sec in secuencias:
            nombre_sec = sec[0]
            # Omitir secuencias de sistema de Oracle si las hubiera
            if 'ISEQ$$' not in nombre_sec: 
                try:
                    sql = f"DROP SEQUENCE {nombre_sec}"
                    cursor.execute(sql)
                    print(f"   🔢 Secuencia eliminada: {nombre_sec}")
                except Exception as e:
                    print(f"   ❌ Error borrando {nombre_sec}: {e}")

    print("\n------------------------------------------------")
    print("✨ LIMPIEZA COMPLETADA. TU BASE DE DATOS ESTÁ VACÍA ✨")
    print("------------------------------------------------")

except oracledb.Error as e:
    print(f"\n❌ ERROR CRÍTICO DE CONEXIÓN: {e}")
    print("Revisa tu archivo .env o tu VPN.")

finally:
    if 'connection' in locals():
        connection.close()