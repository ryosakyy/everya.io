from backend.db import conectar_db

def mejorar_tabla_asistencias():
    conn = conectar_db()
    if not conn: return
    cursor = conn.cursor()
    try:
        print("🔧 Agregando columnas de cálculos...")
        cursor.execute("DROP TABLE IF EXISTS asistencias")
        cursor.execute("""
            CREATE TABLE asistencias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                fecha DATE NOT NULL,
                hora_entrada TIME NOT NULL,
                hora_salida TIME NULL,
                minutos_tarde INT DEFAULT 0,
                descuento_aplicado DECIMAL(10,2) DEFAULT 0.00,
                foto_url VARCHAR(255),
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
            )
        """)
        conn.commit()
        print("✅ Tabla lista para calcular tardanzas y descuentos.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    mejorar_tabla_asistencias()