"""
Attendance routes.
"""
from flask import Blueprint, request, jsonify, send_from_directory
from services import AttendanceService
from config import Config

attendance_bp = Blueprint('attendance', __name__)


@attendance_bp.route("/fotos_asistencia/<path:filename>")
def servir_foto(filename):
    """Serve attendance photos."""
    return send_from_directory(Config.FOTOS_DIR, filename)


@attendance_bp.route("/marcar_asistencia", methods=["POST"])
def marcar_asistencia():
    """Mark attendance (entry or exit)."""
    try:
        data = request.json or {}
        user_id = data.get("id_usuario")
        photo_base64 = data.get("foto")
        
        if not user_id:
            return jsonify({"success": False, "mensaje": "ID de usuario requerido"}), 400
        
        success, message = AttendanceService.mark_attendance(user_id, photo_base64)
        
        if success:
            return jsonify({"success": True, "mensaje": message})
        return jsonify({"success": False, "mensaje": message}), 404
        
    except Exception as e:
        print(f"❌ Error marcar: {e}")
        return jsonify({"success": False, "mensaje": "Error interno"}), 500


@attendance_bp.route("/reportes", methods=["GET"])
def obtener_reportes_globales():
    """Get all attendance reports."""
    try:
        data = AttendanceService.get_all_reports()
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error reportes: {e}")
        return jsonify([])


@attendance_bp.route("/asistencias/usuario/<int:id_usuario>", methods=["GET"])
def obtener_asistencias_usuario(id_usuario):
    """Get attendance history for a specific user."""
    try:
        data = AttendanceService.get_user_attendance(id_usuario)
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error historial: {e}")
        return jsonify([])
