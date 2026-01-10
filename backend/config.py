import os

class Config:
    FOTOS_DIR = "fotos_asistencia"
    HORA_ENTRADA_MANANA = "09:00:00"
    HORA_ENTRADA_TARDE  = "15:00:00"
    TOLERANCIA_MIN = 5
    
    @staticmethod
    def init_app(app):
        os.makedirs(Config.FOTOS_DIR, exist_ok=True)
