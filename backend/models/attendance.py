"""
Attendance model for database operations.
"""
from database import DatabaseConnection


class Attendance:
    """Attendance model with database operations."""
    
    @staticmethod
    def find_by_user_and_date(user_id: int, date: str) -> dict | None:
        """Find attendance record for a user on a specific date."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM asistencias WHERE id_usuario = %s AND fecha = %s",
                (user_id, date)
            )
            record = cursor.fetchone()
            cursor.close()
            return record
    
    @staticmethod
    def create_entry(user_id: int, date: str, time: str, 
                     minutes_late: int, photo_url: str) -> bool:
        """Create a new attendance entry (check-in)."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """INSERT INTO asistencias 
                   (id_usuario, fecha, hora_entrada, minutos_tarde, foto_url) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user_id, date, time, minutes_late, photo_url)
            )
            conn.commit()
            cursor.close()
            return True
    
    @staticmethod
    def update_exit(record_id: int, exit_time: str) -> bool:
        """Update attendance record with exit time."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE asistencias SET hora_salida = %s WHERE id = %s",
                (exit_time, record_id)
            )
            conn.commit()
            cursor.close()
            return True
    
    @staticmethod
    def get_all_with_user_info() -> list:
        """Get all attendance records with user information."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor(dictionary=True)
            query = """
                SELECT a.id, u.nombre_completo, u.dni_usuario, u.turno, u.sueldo_base,
                DATE_FORMAT(a.fecha, '%Y-%m-%d') as fecha,
                a.hora_entrada, a.hora_salida, a.minutos_tarde, a.foto_url
                FROM asistencias a 
                JOIN usuarios u ON a.id_usuario = u.id
                ORDER BY a.fecha DESC, a.hora_entrada DESC
            """
            cursor.execute(query)
            data = cursor.fetchall()
            cursor.close()
            
            # Convert time objects to strings
            for record in data:
                if record['hora_entrada']:
                    record['hora_entrada'] = str(record['hora_entrada'])
                if record['hora_salida']:
                    record['hora_salida'] = str(record['hora_salida'])
            
            return data
    
    @staticmethod
    def get_by_user(user_id: int) -> list:
        """Get all attendance records for a specific user."""
        with DatabaseConnection() as conn:
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
            cursor.close()
            
            # Convert time objects to strings
            for record in data:
                if record['hora_entrada']:
                    record['hora_entrada'] = str(record['hora_entrada'])
                if record['hora_salida']:
                    record['hora_salida'] = str(record['hora_salida'])
            
            return data
