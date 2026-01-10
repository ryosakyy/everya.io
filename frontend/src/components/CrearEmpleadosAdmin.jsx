import { useEffect, useState } from "react";
import "./adminEmpleados.css";

export default function CrearEmpleadosAdmin() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⚠️ DEFINIMOS LA URL DEL BACKEND EN LA NUBE AQUÍ PARA NO EQUIVOCARNOS
  const API_URL = "https://everyaio-production.up.railway.app";

  // Estado del formulario
  const [form, setForm] = useState({
    dni_usuario: "",
    nombre_completo: "",
    password: "",
    turno: "manana",
    rol: "empleado"
  });

  // 1. Cargar empleados existentes
  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      // ✅ CORREGIDO: Usa la URL de Railway
      const res = await fetch(`${API_URL}/admin/usuarios`);

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando empleados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // 2. Crear empleado
  const crearEmpleado = async (e) => {
    e.preventDefault();

    if (!form.dni_usuario || !form.nombre_completo || !form.password) {
      alert("⚠️ Por favor completa todos los campos.");
      return;
    }

    const datosParaBackend = {
      dni_usuario: form.dni_usuario,
      nombre_completo: form.nombre_completo,
      password: form.password,
      turno: form.turno,
      rol: form.rol
    };

    try {
      // ✅ CORREGIDO: Usa la URL de Railway
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaBackend),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Usuario creado correctamente");
        setForm({
          dni_usuario: "",
          nombre_completo: "",
          password: "",
          turno: "manana",
          rol: "empleado"
        });
        cargarEmpleados();
      } else {
        alert(`❌ Error: ${data.mensaje}`);
      }
    } catch (err) {
      console.error("Error en la petición:", err);
      alert("❌ Error de conexión con el servidor");
    }
  };

  // 3. Eliminar empleado
  const eliminarEmpleado = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      // ✅ CORREGIDO: Eliminado el error de doble http:// y puesto la URL correcta
      const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("🗑️ Usuario eliminado");
        cargarEmpleados();
      } else {
        alert("❌ Error al eliminar");
      }
    } catch {
      alert("❌ Error de conexión");
    }
  };

  return (
    <section className="dash-card">
      <h2 className="dash-card-title">👥 Gestión de Personal</h2>

      <form className="emp-form" onSubmit={crearEmpleado}>
        <input
          type="text"
          placeholder="DNI (Usuario)"
          value={form.dni_usuario}
          onChange={(e) => setForm({ ...form, dni_usuario: e.target.value })}
        />

        <input
          type="text"
          placeholder="Nombre Completo"
          value={form.nombre_completo}
          onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })}>
            <option value="manana">🌞 Mañana</option>
            <option value="tarde">🌅 Tarde</option>
          </select>

          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            <option value="empleado">Trabajador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <button type="submit" className="btn-submit">➕ Crear Usuario</button>
      </form>

      <hr />

      {loading ? <p>Cargando lista...</p> : (
        <ul className="emp-list">
          {empleados.length === 0 ? <p>No hay empleados registrados.</p> :
            empleados.map((emp) => (
              <li key={emp.id} className="emp-item">
                <div className="emp-info">
                  <strong>{emp.nombre_completo}</strong>
                  <span className="emp-dni"> (DNI: {emp.dni_usuario})</span>
                  <br />
                  <small className="emp-detail">
                    {emp.turno} - {emp.rol === 'admin' ? <b style={{ color: 'red' }}>ADMIN</b> : 'Trabajador'}
                  </small>
                </div>

                <button
                  onClick={() => eliminarEmpleado(emp.id)}
                  className="btn-delete"
                >
                  Eliminar
                </button>
              </li>
            ))
          }
        </ul>
      )}
    </section>
  );
}