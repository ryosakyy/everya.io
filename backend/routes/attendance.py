from flask import Blueprint, request, jsonify, send_from_directory
from config import Config
from utils import get_server_now, calcular_minutos_tarde
from models.user_model import UserModel
from models.attendance_model import AttendanceModel
import os
import base64

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route("/fotos_asistencia/<path:filename>")
def servir_foto(filename):
    return send_from_directory(Config.FOTOS_DIR, filename)

@attendance_bp.route("/marcar_asistencia", methods=["POST"])
def marcar_asistencia():
    try:
        data = request.json
        id_usuario = data.get("id_usuario")
        foto_b64 = data.get("foto")

        u = UserModel.get_by_id(id_usuario)
        if not u: return jsonify({"success": False, "mensaje": "Usuario no encontrado"}), 404
        
        ahora = get_server_now()
        fecha = ahora.strftime("%Y-%m-%d")
        hora = ahora.strftime("%H:%M:%S")
        nombre_foto = f"{id_usuario}_{fecha}_{ahora.strftime('%H%M%S')}.jpg"

        try:
            if foto_b64 and "," in foto_b64: foto_b64 = foto_b64.split(",")[1]
            if foto_b64:
                with open(os.path.join(Config.FOTOS_DIR, nombre_foto), "wb") as f:
                    f.write(base64.b64decode(foto_b64))
        except: pass

        reg = AttendanceModel.get_today_record(id_usuario, fecha)
        
        msg = ""
        if not reg:
            hora_obj = Config.HORA_ENTRADA_TARDE if u["turno"] == "tarde" else Config.HORA_ENTRADA_MANANA
            tarde = calcular_minutos_tarde(ahora, hora_obj)
            if AttendanceModel.create_checkin(id_usuario, fecha, hora, tarde, nombre_foto):
                msg = "Entrada registrada"
            else:
                return jsonify({"success": False, "mensaje": "Error registrando entrada"}), 500
        else:
            if AttendanceModel.update_checkout(reg["id"], hora):
                msg = "Salida registrada"
            else:
                return jsonify({"success": False, "mensaje": "Error registrando salida"}), 500

        return jsonify({"success": True, "mensaje": msg})
    except Exception as e:
        print(f"❌ Error marcar: {e}")
        return jsonify({"success": False, "mensaje": "Error interno"}), 500

@attendance_bp.route("/reportes", methods=["GET"])
def obtener_reportes_globales():
    try:
        data = AttendanceModel.get_all_reports()
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error reportes: {e}")
        return jsonify([])

@attendance_bp.route("/asistencias/usuario/<int:id_usuario>", methods=["GET"])
def obtener_asistencias_usuario(id_usuario):
    try:
        data = AttendanceModel.get_by_user(id_usuario)
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error historial: {e}")
        return jsonify([])
