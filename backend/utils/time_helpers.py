"""
Time helper functions for the application.
"""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from config import Config

# Peru timezone
TZ = ZoneInfo("America/Lima")


def get_server_now():
    """Get current server time in Peru timezone."""
    return datetime.now(TZ)


def calcular_minutos_tarde(ahora, hora_objetivo_str: str) -> int:
    """
    Calculate minutes late based on target time and tolerance.
    
    Args:
        ahora: Current datetime
        hora_objetivo_str: Target time as string "HH:MM:SS"
    
    Returns:
        int: Minutes late (0 if on time or early)
    """
    t_actual = datetime.strptime(ahora.strftime("%H:%M:%S"), "%H:%M:%S")
    t_obj = datetime.strptime(hora_objetivo_str, "%H:%M:%S")
    
    # Add tolerance to target time
    base = datetime.combine(datetime.today(), t_obj.time()) + timedelta(minutes=Config.TOLERANCIA_MIN)
    t_obj_tol = datetime.strptime(base.strftime("%H:%M:%S"), "%H:%M:%S")
    
    if t_actual > t_obj_tol:
        return int((t_actual - t_obj).total_seconds() / 60)
    return 0
