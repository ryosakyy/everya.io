from db import conectar_db

def ver_tipo_rol():
    try:
        conn = conectar_db()
        if not conn:
            print("❌ Error de conexión")
            return
        
        cursor = conn.cursor()
        # Pedimos el detalle completo de la columna 'rol'
        print("\n--- DETALLES DE LA COLUMNA 'ROL' ---")
        cursor.execute("DESCRIBE usuarios")
        
        # Buscamos la fila correspondiente al campo 'rol'
        columnas = cursor.fetchall()
        for col in columnas:
            # col[0] es el nombre, col[1] es el TIPO (lo que necesitamos)
            if col[0] == 'rol':
                print(f"👉 NOMBRE: {col[0]}")
                print(f"👉 TIPO PERMITIDO: {col[1]}") # Aquí saldrá algo como varchar(20) o enum('admin','user')
                
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    ver_tipo_rol()