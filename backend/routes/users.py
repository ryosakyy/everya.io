from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models.user_model import UserModel

users_bp = Blueprint('users', __name__)

@users_bp.route("/admin/usuarios", methods=["GET"])
def listar_usuarios():
    try:
        users = UserModel.get_all()
        return jsonify(users)
    except Exception as e:
        print(f"❌ CRASH listar_usuarios: {e}")
        return jsonify({"error": str(e)}), 500

@users_bp.route("/admin/usuarios", methods=["POST"])
def crear_usuario():
    try:
        data = request.json
        dni = data.get("dni_usuario")
        nombre = data.get("nombre_completo")
        password = data.get("password")
        
        rol_input = str(data.get("rol", "")).strip().lower()
        rol = "admin" if "admin" in rol_input else "empleado"
        turno = data.get("turno", "manana")

        if not dni or not nombre or not password:
            return jsonify({"success": False, "mensaje": "Faltan datos"}), 400

        if UserModel.get_by_dni(dni):
            return jsonify({"success": False, "mensaje": "El DNI ya existe"}), 400

        pwd_hash = generate_password_hash(password)
        
        if UserModel.create(dni, nombre, password, pwd_hash, rol, turno):
            return jsonify({"success": True, "mensaje": "Usuario creado correctamente"})
        else:
            return jsonify({"success": False, "mensaje": "Error al crear usuario"}), 500

    except Exception as e:
        print(f"❌ CRASH crear_usuario: {e}")
        return jsonify({"success": False, "mensaje": f"Error servidor: {str(e)}"}), 500

@users_bp.route("/admin/usuarios/<int:id_usuario>", methods=["DELETE"])
def eliminar_usuario(id_usuario):
    try:
        if UserModel.delete(id_usuario):
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "mensaje": "Error al eliminar"}), 500
    except Exception as e:
        print(f"❌ Error eliminar: {e}")
        return jsonify({"success": False, "mensaje": str(e)}), 500
