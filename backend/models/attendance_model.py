from db import conectar_db

class AttendanceModel:
    @staticmethod
    def get_today_record(user_id, fecha):
        conn = conectar_db()
        if not conn: return None
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM asistencias WHERE id_usuario=%s AND fecha=%s", (user_id, fecha))
            return cursor.fetchone()
        finally:
            if conn: conn.close()

    @staticmethod
    def create_checkin(user_id, fecha, hora, minutos_tarde, foto_url):
        conn = conectar_db()
        if not conn: return False
        try:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO asistencias (id_usuario, fecha, hora_entrada, minutos_tarde, foto_url) VALUES (%s,%s,%s,%s,%s)",
                           (user_id, fecha, hora, minutos_tarde, foto_url))
            conn.commit()
            cursor.close()
            return True
        except Exception as e:
            print(f"Error checkin: {e}")
            return False
        finally:
            if conn: conn.close()

    @staticmethod
    def update_checkout(record_id, hora_salida):
        conn = conectar_db()
        if not conn: return False
        try:
            cursor = conn.cursor()
            cursor.execute("UPDATE asistencias SET hora_salida=%s WHERE id=%s", (hora_salida, record_id))
            conn.commit()
            cursor.close()
            return True
        except Exception as e:
            print(f"Error checkout: {e}")
            return False
        finally:
            if conn: conn.close()

    @staticmethod
    def get_all_reports():
        conn = conectar_db()
        if not conn: return []
        try:
            cursor = conn.cursor(dictionary=True)
            query = """
                SELECT a.id, u.nombre_completo, u.dni_usuario, u.turno,
                DATE_FORMAT(a.fecha, '%Y-%m-%d') as fecha,
                a.hora_entrada, a.hora_salida, a.minutos_tarde, a.foto_url
                FROM asistencias a JOIN usuarios u ON a.id_usuario = u.id
                ORDER BY a.fecha DESC, a.hora_entrada DESC
            """
            cursor.execute(query)
            data = cursor.fetchall()
            for d in data:
                if d['hora_entrada']: d['hora_entrada'] = str(d['hora_entrada'])
                if d['hora_salida']: d['hora_salida'] = str(d['hora_salida'])
            return data
        finally:
            if conn: conn.close()

    @staticmethod
    def get_by_user(user_id):
        conn = conectar_db()
        if not conn: return []
        try:
            cursor = conn.cursor(dictionary=True)
            query = """
                SELECT id, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,
                       hora_entrada, hora_salida, minutos_tarde, foto_url
                FROM asistencias 
                WHERE id_usuario = %s
                ORDER BY fecha DESC
            """
            cursor.execute(query, (user_id,))
            data = cursor.fetchall()
            for d in data:
                if d['hora_entrada']: d['hora_entrada'] = str(d['hora_entrada'])
                if d['hora_salida']: d['hora_salida'] = str(d['hora_salida'])
            return data
        finally:
            if conn: conn.close()
