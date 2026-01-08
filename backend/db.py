import mysql.connector

def conectar_db():
    try:
        connection = mysql.connector.connect(
            host="shortline.proxy.rlwy.net",
            port=25486,
            user="root",
            password="DanUWessOwkRDUEPXdGibtAgOQuqxyoi",
            database="railway",
            connection_timeout=10
        )
        return connection
    except Exception as err:
        print(f"❌ Error al conectar: {err}")
        return None
