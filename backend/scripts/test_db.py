from db import conectar_db

conn = conectar_db()
print("CONN:", conn)

if conn:
    cur = conn.cursor()
    cur.execute("SELECT 1")
    print("OK:", cur.fetchone())
    cur.close()
    conn.close()
