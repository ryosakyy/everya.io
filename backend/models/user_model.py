from db import conectar_db

class UserModel:
    @staticmethod
    def get_by_dni(dni):
        conn = conectar_db()
        if not conn: return None
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE dni_usuario = %s", (dni,))
            user = cursor.fetchone()
            cursor.close()
            return user
        finally:
            conn.close()

    @staticmethod
    def get_by_id(user_id):
        conn = conectar_db()
        if not conn: return None
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            cursor.close()
            return user
        finally:
            conn.close()

    @staticmethod
    def get_all():
        conn = conectar_db()
        if not conn: return []
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, dni_usuario, nombre_completo, rol, turno FROM usuarios")
            users = cursor.fetchall()
            cursor.close()
            return users
        finally:
            conn.close()

    @staticmethod
    def create(dni, nombre, password, pwd_hash, rol, turno):
        conn = conectar_db()
        if not conn: return False
        try:
            cursor = conn.cursor()
            query = """
                INSERT INTO usuarios 
                (dni_usuario, nombre_completo, password, password_hash, rol, turno, sueldo_base, horas_mensuales, estado) 
                VALUES (%s, %s, %s, %s, %s, %s, 0, 0, 1)
            """
            cursor.execute(query, (dni, nombre, password, pwd_hash, rol, turno))
            conn.commit()
            cursor.close()
            return True
        except Exception as e:
            print(f"Error creating user: {e}")
            return False
        finally:
            if conn: conn.close()

    @staticmethod
    def delete(user_id):
        conn = conectar_db()
        if not conn: return False
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM asistencias WHERE id_usuario = %s", (user_id,))
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (user_id,))
            conn.commit()
            cursor.close()
            return True
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False
        finally:
            if conn: conn.close()
