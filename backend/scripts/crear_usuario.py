import mysql.connector
from werkzeug.security import generate_password_hash

def arreglar_admin_definitivo():
    try:
        connection = mysql.connector.connect(
            host="shortline.proxy.rlwy.net",
            port=25486,
            user="root",
            password="DanUWessOwkRDUEPXdGibtAgOQuqxyoi",
            database="railway"
        )
        cursor = connection.cursor()
        
        # 1. Generamos el hash
        nueva_clave = "123456"
        hash_seguro = generate_password_hash(nueva_clave)
        
        print("🔄 Sincronizando contraseñas para 'admin'...")

        # 2. Actualizamos AMBAS columnas para que no haya confusión
        # Usamos try/except por si acaso tu BD no tenga la columna password_hash,
        # aunque el error sugiere que sí la tiene.
        try:
            sql = """
                UPDATE usuarios 
                SET password = %s, password_hash = %s, rol = 'admin', turno = 'manana'
                WHERE dni_usuario = 'admin'
            """
            cursor.execute(sql, (hash_seguro, hash_seguro))
        except mysql.connector.Error as err:
            print(f"⚠️ Aviso: {err}")
            print("Intentando actualizar solo columna 'password'...")
            sql_fallback = "UPDATE usuarios SET password = %s WHERE dni_usuario = 'admin'"
            cursor.execute(sql_fallback, (hash_seguro,))

        connection.commit()
        
        if cursor.rowcount > 0:
            print("✅ ÉXITO TOTAL: Admin actualizado.")
        else:
            print("⚠️ No se encontró al usuario 'admin'. (Extraño, porque el error 1451 decía que sí existe).")

        print(f"🔑 Contraseña establecida: {nueva_clave}")
        
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"❌ Error grave: {e}")

if __name__ == "__main__":
    arreglar_admin_definitivo()