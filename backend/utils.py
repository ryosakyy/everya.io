from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from config import Config

TZ = ZoneInfo("America/Lima")

def get_server_now():
    return datetime.now(TZ)

def calcular_minutos_tarde(ahora, hora_objetivo_str):
    t_actual = datetime.strptime(ahora.strftime("%H:%M:%S"), "%H:%M:%S")
    t_obj = datetime.strptime(hora_objetivo_str, "%H:%M:%S")
    base = datetime.combine(datetime.today(), t_obj.time()) + timedelta(minutes=Config.TOLERANCIA_MIN)
    t_obj_tol = datetime.strptime(base.strftime("%H:%M:%S"), "%H:%M:%S")
    if t_actual > t_obj_tol:
        return int((t_actual - t_obj).total_seconds() / 60)
    return 0
