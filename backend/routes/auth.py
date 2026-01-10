"""
Authentication routes.
"""
from flask import Blueprint, request, jsonify
from services import AuthService

auth_bp = Blueprint('auth', __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """Handle user login."""
    try:
        data = request.json or {}
        dni = data.get("dni_usuario", "")
        password = data.get("password", "")
        
        success, user, message = AuthService.authenticate(dni, password)
        
        if success:
            return jsonify({"success": True, "usuario": user})
        return jsonify({"success": False, "mensaje": message}), 401
        
    except Exception as e:
        print(f"❌ Error Login: {e}")
        return jsonify({"success": False, "mensaje": "Error interno"}), 500
