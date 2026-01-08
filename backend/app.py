from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from db import conectar_db 
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import base64
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
# Permitir CORS para todas las rutas
CORS(app, resources={r"/*": {"origins": "*"}})

TZ = ZoneInfo("America/Lima")
FOTOS_DIR = "fotos_asistencia"
os.makedirs(FOTOS_DIR, exist_ok=True)

HORA_ENTRADA_MANANA = "09:00:00"
HORA_ENTRADA_TARDE  = "15:00:00"
TOLERANCIA_MIN = 5

def get_server_now():
    return datetime.now(TZ)

def calcular_minutos_tarde(ahora, hora_objetivo_str):
    t_actual = datetime.strptime(ahora.strftime("%H:%M:%S"), "%H:%M:%S")
    t_obj = datetime.strptime(hora_objetivo_str, "%H:%M:%S")
    base = datetime.combine(datetime.today(), t_obj.time()) + timedelta(minutes=TOLERANCIA_MIN)
    t_obj_tol = datetime.strptime(base.strftime("%H:%M:%S"), "%H:%M:%S")
    if t_actual > t_obj_tol:
        return int((t_actual - t_obj).total_seconds() / 60)
    return 0

# --- RUTA PARA SERVIR LAS FOTOS ---
@app.route("/fotos_asistencia/<path:filename>")
def servir_foto(filename):
    return send_from_directory(FOTOS_DIR, filename)

# --- 1. LOGIN ---
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json or {}
        dni = data.get("dni_usuario", "").strip()
        password = data.get("password", "").strip()

        conn = conectar_db()
        if not conn: return jsonify({"success": False, "mensaje": "Error DB"}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE dni_usuario = %s", (dni,))
        user = cursor.fetchone()
        cursor.close(); conn.close()

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

# --- 2. GESTIÓN DE USUARIOS ---
@app.route("/admin/usuarios", methods=["GET"])
def listar_usuarios():
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, dni_usuario, nombre_completo, rol, turno FROM usuarios")
        users = cursor.fetchall()
        cursor.close(); conn.close()
        return jsonify(users)
    except Exception as e:
        print(f"❌ CRASH listar_usuarios: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/admin/usuarios", methods=["POST"])
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

        pwd_hash = generate_password_hash(password)
        conn = conectar_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM usuarios WHERE dni_usuario = %s", (dni,))
        if cursor.fetchone():
            cursor.close(); conn.close()
            return jsonify({"success": False, "mensaje": "El DNI ya existe"}), 400

        query = """
            INSERT INTO usuarios 
            (dni_usuario, nombre_completo, password, password_hash, rol, turno, sueldo_base, horas_mensuales, estado) 
            VALUES (%s, %s, %s, %s, %s, %s, 0, 0, 1)
        """
        cursor.execute(query, (dni, nombre, password, pwd_hash, rol, turno))
        conn.commit()
        
        cursor.close(); conn.close()
        return jsonify({"success": True, "mensaje": "Usuario creado correctamente"})

    except Exception as e:
        print(f"❌ CRASH crear_usuario: {e}")
        return jsonify({"success": False, "mensaje": f"Error servidor: {str(e)}"}), 500

@app.route("/admin/usuarios/<int:id_usuario>", methods=["DELETE"])
def eliminar_usuario(id_usuario):
    try:
        conn = conectar_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM asistencias WHERE id_usuario = %s", (id_usuario,))
        cursor.execute("DELETE FROM usuarios WHERE id = %s", (id_usuario,))
        conn.commit()
        cursor.close(); conn.close()
        return jsonify({"success": True})
    except Exception as e:
        print(f"❌ Error eliminar: {e}")
        return jsonify({"success": False, "mensaje": str(e)}), 500

# --- 3. ASISTENCIAS Y REPORTES ---
@app.route("/marcar_asistencia", methods=["POST"])
def marcar_asistencia():
    try:
        data = request.json
        id_usuario = data.get("id_usuario")
        foto_b64 = data.get("foto")

        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT turno FROM usuarios WHERE id=%s", (id_usuario,))
        u = cursor.fetchone()
        
        if not u: return jsonify({"success": False, "mensaje": "Usuario no encontrado"}), 404
        
        ahora = get_server_now()
        fecha = ahora.strftime("%Y-%m-%d")
        hora = ahora.strftime("%H:%M:%S")
        nombre_foto = f"{id_usuario}_{fecha}_{ahora.strftime('%H%M%S')}.jpg"

        try:
            if foto_b64 and "," in foto_b64: foto_b64 = foto_b64.split(",")[1]
            if foto_b64:
                with open(os.path.join(FOTOS_DIR, nombre_foto), "wb") as f:
                    f.write(base64.b64decode(foto_b64))
        except: pass

        cursor.execute("SELECT * FROM asistencias WHERE id_usuario=%s AND fecha=%s", (id_usuario, fecha))
        reg = cursor.fetchone()
        
        msg = ""
        if not reg:
            hora_obj = HORA_ENTRADA_TARDE if u["turno"] == "tarde" else HORA_ENTRADA_MANANA
            tarde = calcular_minutos_tarde(ahora, hora_obj)
            cursor.execute("INSERT INTO asistencias (id_usuario, fecha, hora_entrada, minutos_tarde, foto_url) VALUES (%s,%s,%s,%s,%s)",
                           (id_usuario, fecha, hora, tarde, nombre_foto))
            msg = "Entrada registrada"
        else:
            cursor.execute("UPDATE asistencias SET hora_salida=%s WHERE id=%s", (hora, reg["id"]))
            msg = "Salida registrada"

        conn.commit()
        cursor.close(); conn.close()
        return jsonify({"success": True, "mensaje": msg})
    except Exception as e:
        print(f"❌ Error marcar: {e}")
        return jsonify({"success": False, "mensaje": "Error interno"}), 500

@app.route("/reportes", methods=["GET"])
def obtener_reportes_globales():
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT a.id, u.nombre_completo, u.dni_usuario, u.turno,
            DATE_FORMAT(a.fecha, '%Y-%m-%d') as fecha,
            a.hora_entrada, a.hora_salida, a.minutos_tarde, a.foto_url
            FROM asistencias a JOIN usuarios u ON a.id_usuario = u.id
            ORDER BY a.fecha DESC, a.hora_entrada DESC
        """
        cursor.execute(query)
        data = cursor.fetchall()
        
        for d in data:
            if d['hora_entrada']: d['hora_entrada'] = str(d['hora_entrada'])
            if d['hora_salida']: d['hora_salida'] = str(d['hora_salida'])
                
        cursor.close(); conn.close()
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error reportes: {e}")
        return jsonify([])

# --- ENDPOINT CALENDARIO: Asegura traer foto_url ---
@app.route("/asistencias/usuario/<int:id_usuario>", methods=["GET"])
def obtener_asistencias_usuario(id_usuario):
    try:
        conn = conectar_db()
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT id, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,
                   hora_entrada, hora_salida, minutos_tarde, foto_url
            FROM asistencias 
            WHERE id_usuario = %s
            ORDER BY fecha DESC
        """
        cursor.execute(query, (id_usuario,))
        data = cursor.fetchall()
        
        for d in data:
            if d['hora_entrada']: d['hora_entrada'] = str(d['hora_entrada'])
            if d['hora_salida']: d['hora_salida'] = str(d['hora_salida'])

        cursor.close(); conn.close()
        return jsonify(data)
    except Exception as e:
        print(f"❌ Error historial: {e}")
        return jsonify([])

if __name__ == "__main__":
    app.run(debug=True, port=5000)