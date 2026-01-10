"""
User service - handles user management logic.
"""
from werkzeug.security import generate_password_hash
from models import User


class UserService:
    """Service for user management operations."""
    
    @staticmethod
    def get_all_users() -> list:
        """Get all users."""
        return User.get_all()
    
    @staticmethod
    def create_user(dni: str, nombre: str, password: str, 
                    rol: str = "", turno: str = "manana") -> tuple[bool, str]:
        """
        Create a new user.
        
        Returns:
            tuple: (success: bool, message: str)
        """
        if not dni or not nombre or not password:
            return False, "Faltan datos obligatorios"
        
        # Normalize role
        rol_normalized = "admin" if "admin" in str(rol).strip().lower() else "empleado"
        
        # Generate password hash
        password_hash = generate_password_hash(password)
        
        success = User.create(
            dni=dni,
            nombre=nombre,
            password=password,
            password_hash=password_hash,
            rol=rol_normalized,
            turno=turno
        )
        
        if success:
            return True, "Usuario creado correctamente"
        return False, "El DNI ya existe"
    
    @staticmethod
    def delete_user(user_id: int) -> tuple[bool, str]:
        """
        Delete a user.
        
        Returns:
            tuple: (success: bool, message: str)
        """
        success = User.delete(user_id)
        if success:
            return True, "Usuario eliminado"
        return False, "Error al eliminar usuario"
