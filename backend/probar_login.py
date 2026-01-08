import requests

# 1. Definimos a dónde vamos a "tocar la puerta"
url = 'http://127.0.0.1:5000/login'

# 2. Preparamos los datos (como si los escribieras en la App)
datos_usuario = {
    "dni_usuario": "admin",
    "password": "123456"  # Prueba cambiando esto luego para ver si falla
}

print(f"📡 Enviando datos a {url}...")

try:
    # 3. Hacemos la petición POST
    respuesta = requests.post(url, json=datos_usuario)
    
    # 4. Mostramos qué nos respondió el servidor
    print("\n--- RESPUESTA DEL SERVIDOR ---")
    print(f"Código de estado: {respuesta.status_code}") # 200 es OK, 401 es Error, 500 es Fallo grave
    print("Datos recibidos:", respuesta.json())

except Exception as e:
    print(f"❌ Error: {e}")