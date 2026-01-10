"""
Authentication service - handles login logic.
"""
from werkzeug.security import check_password_hash
from models import User


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def authenticate(dni: str, password: str) -> tuple[bool, dict | None, str]:
        """
        Authenticate a user with DNI and password.
        
        Returns:
            tuple: (success: bool, user: dict | None, message: str)
        """
        if not dni or not password:
            return False, None, "DNI y contraseña son requeridos"
        
        user = User.find_by_dni(dni.strip())
        
        if not user:
            return False, None, "Credenciales inválidas"
        
        # Check password
        password_valid = False
        stored_hash = user.get("password_hash")
        stored_pass = user.get("password")
        
        # Try hash first (secure method)
        if stored_hash and (stored_hash.startswith("scrypt:") or stored_hash.startswith("pbkdf2:")):
            if check_password_hash(stored_hash, password.strip()):
                password_valid = True
        # Fallback to plain password (legacy, should migrate)
        elif stored_pass == password.strip():
            password_valid = True
        
        if password_valid:
            # Remove sensitive data before returning
            safe_user = User.sanitize_for_response(user)
            return True, safe_user, "Login exitoso"
        
        return False, None, "Credenciales inválidas"
