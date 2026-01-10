"""
User model for database operations.
"""
from database import DatabaseConnection


class User:
    """User model with database operations."""
    
    @staticmethod
    def find_by_dni(dni: str) -> dict | None:
        """Find a user by DNI."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE dni_usuario = %s", (dni,))
            user = cursor.fetchone()
            cursor.close()
            return user
    
    @staticmethod
    def find_by_id(user_id: int) -> dict | None:
        """Find a user by ID."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            cursor.close()
            return user
    
    @staticmethod
    def get_all() -> list:
        """Get all users (basic info only)."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                "SELECT id, dni_usuario, nombre_completo, rol, turno, sueldo_base FROM usuarios"
            )
            users = cursor.fetchall()
            cursor.close()
            return users
    
    @staticmethod
    def create(dni: str, nombre: str, password: str, password_hash: str, 
               rol: str = "empleado", turno: str = "manana") -> bool:
        """Create a new user."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            
            # Check if DNI already exists
            cursor.execute("SELECT id FROM usuarios WHERE dni_usuario = %s", (dni,))
            if cursor.fetchone():
                cursor.close()
                return False
            
            query = """
                INSERT INTO usuarios 
                (dni_usuario, nombre_completo, password, password_hash, rol, turno, sueldo_base, horas_mensuales, estado) 
                VALUES (%s, %s, %s, %s, %s, %s, 0, 0, 1)
            """
            cursor.execute(query, (dni, nombre, password, password_hash, rol, turno))
            conn.commit()
            cursor.close()
            return True
    
    @staticmethod
    def delete(user_id: int) -> bool:
        """Delete a user and their attendance records."""
        with DatabaseConnection() as conn:
            cursor = conn.cursor()
            # Delete attendance records first
            cursor.execute("DELETE FROM asistencias WHERE id_usuario = %s", (user_id,))
            # Delete user
            cursor.execute("DELETE FROM usuarios WHERE id = %s", (user_id,))
            conn.commit()
            cursor.close()
            return True
    
    @staticmethod
    def sanitize_for_response(user: dict) -> dict:
        """Remove sensitive fields from user data."""
        if user:
            user.pop("password_hash", None)
            user.pop("password", None)
        return user
