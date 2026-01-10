"""
Attendance service - handles attendance marking logic.
"""
import os
import base64
from models import User, Attendance
from utils import get_server_now, calcular_minutos_tarde
from config import Config


class AttendanceService:
    """Service for attendance operations."""
    
    @staticmethod
    def mark_attendance(user_id: int, photo_base64: str | None) -> tuple[bool, str]:
        """
        Mark attendance (entry or exit).
        
        Returns:
            tuple: (success: bool, message: str)
        """
        # Get user to check shift
        user = User.find_by_id(user_id)
        if not user:
            return False, "Usuario no encontrado"
        
        # Get current time
        now = get_server_now()
        date = now.strftime("%Y-%m-%d")
        time = now.strftime("%H:%M:%S")
        photo_filename = f"{user_id}_{date}_{now.strftime('%H%M%S')}.jpg"
        
        # Save photo if provided
        AttendanceService._save_photo(photo_base64, photo_filename)
        
        # Check if there's already a record for today
        existing = Attendance.find_by_user_and_date(user_id, date)
        
        if not existing:
            # Create new entry (check-in)
            shift_time = (Config.HORA_ENTRADA_TARDE 
                         if user["turno"] == "tarde" 
                         else Config.HORA_ENTRADA_MANANA)
            minutes_late = calcular_minutos_tarde(now, shift_time)
            
            Attendance.create_entry(user_id, date, time, minutes_late, photo_filename)
            return True, "Entrada registrada"
        else:
            # Update existing record with exit time
            Attendance.update_exit(existing["id"], time)
            return True, "Salida registrada"
    
    @staticmethod
    def _save_photo(photo_base64: str | None, filename: str) -> bool:
        """Save base64 photo to disk."""
        try:
            if not photo_base64:
                return False
            
            # Remove data URL prefix if present
            if "," in photo_base64:
                photo_base64 = photo_base64.split(",")[1]
            
            filepath = os.path.join(Config.FOTOS_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(base64.b64decode(photo_base64))
            return True
        except Exception:
            return False
    
    @staticmethod
    def get_all_reports() -> list:
        """Get all attendance reports with user info."""
        return Attendance.get_all_with_user_info()
    
    @staticmethod
    def get_user_attendance(user_id: int) -> list:
        """Get attendance history for a specific user."""
        return Attendance.get_by_user(user_id)
