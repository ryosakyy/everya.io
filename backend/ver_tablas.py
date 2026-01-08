from db import conectar_db

def revisar_columnas():
    try:
        conn = conectar_db()
        if not conn:
            print("❌ No hay conexión a la BD")
            return
        
        cursor = conn.cursor()
        print("\n--- COLUMNAS DE LA TABLA 'USUARIOS' ---")
        cursor.execute("DESCRIBE usuarios")
        for col in cursor.fetchall():
            # col[0] es el nombre del campo
            print(f"👉 {col[0]}")

        print("\n--- COLUMNAS DE LA TABLA 'ASISTENCIAS' ---")
        cursor.execute("DESCRIBE asistencias")
        for col in cursor.fetchall():
            print(f"👉 {col[0]}")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    revisar_columnas()