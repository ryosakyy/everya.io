import mysql.connector
from werkzeug.security import generate_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

def ensure_test_users():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "shortline.proxy.rlwy.net"),
            port=int(os.getenv("DB_PORT", 25486)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", "DanUWessOwkRDUEPXdGibtAgOQuqxyoi"),
            database=os.getenv("DB_NAME", "railway")
        )
        cursor = connection.cursor()
        
        pwd_hash = generate_password_hash("123456")
        
        # 1. Ensure Admin
        cursor.execute("SELECT id FROM usuarios WHERE dni_usuario = 'admin'")
        if cursor.fetchone():
            print("Updating existing admin user...")
            cursor.execute("""
                UPDATE usuarios 
                SET password_hash = %s, nombre_completo = 'Admin User', rol = 'admin', turno = 'manana'
                WHERE dni_usuario = 'admin'
            """, (pwd_hash,))
        else:
            print("Creating admin user...")
            cursor.execute("""
                INSERT INTO usuarios (dni_usuario, nombre_completo, password, password_hash, rol, turno, sueldo_base, horas_mensuales, estado)
                VALUES ('admin', 'Admin User', '123456', %s, 'admin', 'manana', 2000, 160, 1)
            """, (pwd_hash,))

        # 2. Ensure Employee
        cursor.execute("SELECT id FROM usuarios WHERE dni_usuario = 'empleado'")
        if cursor.fetchone():
            print("Updating existing employee user...")
            cursor.execute("""
                UPDATE usuarios 
                SET password_hash = %s, nombre_completo = 'Test Employee', rol = 'empleado', turno = 'manana'
                WHERE dni_usuario = 'empleado'
            """, (pwd_hash,))
        else:
            print("Creating employee user...")
            cursor.execute("""
                INSERT INTO usuarios (dni_usuario, nombre_completo, password, password_hash, rol, turno, sueldo_base, horas_mensuales, estado)
                VALUES ('empleado', 'Test Employee', '123456', %s, 'empleado', 'manana', 1200, 180, 1)
            """, (pwd_hash,))

        connection.commit()
        print("Test users ensured: 'admin' and 'empleado' with password '123456'")
        
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    ensure_test_users()
