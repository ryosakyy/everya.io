"""
User management routes.
"""
from flask import Blueprint, request, jsonify
from services import UserService

users_bp = Blueprint('users', __name__)


@users_bp.route("/admin/usuarios", methods=["GET"])
def listar_usuarios():
    """Get all users."""
    try:
        users = UserService.get_all_users()
        return jsonify(users)
    except Exception as e:
        print(f"❌ Error listar_usuarios: {e}")
        return jsonify({"error": str(e)}), 500


@users_bp.route("/admin/usuarios", methods=["POST"])
def crear_usuario():
    """Create a new user."""
    try:
        data = request.json or {}
        
        success, message = UserService.create_user(
            dni=data.get("dni_usuario"),
            nombre=data.get("nombre_completo"),
            password=data.get("password"),
            rol=data.get("rol", ""),
            turno=data.get("turno", "manana")
        )
        
        if success:
            return jsonify({"success": True, "mensaje": message})
        return jsonify({"success": False, "mensaje": message}), 400
        
    except Exception as e:
        print(f"❌ Error crear_usuario: {e}")
        return jsonify({"success": False, "mensaje": f"Error servidor: {str(e)}"}), 500


@users_bp.route("/admin/usuarios/<int:id_usuario>", methods=["DELETE"])
def eliminar_usuario(id_usuario):
    """Delete a user."""
    try:
        success, message = UserService.delete_user(id_usuario)
        return jsonify({"success": success, "mensaje": message})
    except Exception as e:
        print(f"❌ Error eliminar: {e}")
        return jsonify({"success": False, "mensaje": str(e)}), 500
