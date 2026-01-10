from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from models.user_model import UserModel

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        dni = data.get("dni_usuario", "").strip()
        password = data.get("password", "").strip()

        user = UserModel.get_by_dni(dni)
        
        if user:
            pwd_ok = False
            stored_hash = user.get("password_hash")
            stored_pass = user.get("password")
            
            if stored_hash and (stored_hash.startswith("scrypt:") or stored_hash.startswith("pbkdf2:")):
                 if check_password_hash(stored_hash, password): pwd_ok = True
            elif stored_pass == password:
                 pwd_ok = True
            
            if pwd_ok:
                user.pop("password_hash", None)
                user.pop("password", None)
                return jsonify({"success": True, "usuario": user})
        
        return jsonify({"success": False, "mensaje": "Credenciales inválidas"}), 401
    except Exception as e:
        print(f"❌ Error Login: {e}")
        return jsonify({"success": False, "mensaje": "Error interno"}), 500
