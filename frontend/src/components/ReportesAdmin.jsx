import axios from "axios";
import { useEffect, useState } from "react";
import "./reportesAdmin.css";

export default function ReportesAdmin() {
  const [cargando, setCargando] = useState(true);
  const [items, setItems] = useState([]);
  const [filtro, setFiltro] = useState("TODOS"); // TODOS | MANANA | TARDE

  // 1. URL DEL BACKEND (Asegúrate que coincida con tu terminal Python)
  const API_URL = "http://127.0.0.1:5000";

  const cargar = async () => {
    try {
      setCargando(true);
      // Petición al backend
      const res = await axios.get(`${API_URL}/reportes`);
      const data = res.data;

      const lista = Array.isArray(data) ? data : data?.data || [];
      setItems(lista);
    } catch (e) {
      console.error(e);
      alert("❌ No se pudo cargar reportes");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // --- LOGICA DE FILTRO ---
  const filtrados = items.filter((r) => {
    if (filtro === "TODOS") return true;

    const turnoReal = (r.turno || "manana").toLowerCase();

    if (filtro === "MANANA") {
        return turnoReal === "manana" || turnoReal === "mañana";
    }
    if (filtro === "TARDE") {
        return turnoReal === "tarde";
    }
    return true;
  });

  return (
    <section className="rep-card">
      <div className="rep-head">
        <div>
          <h2 className="rep-title">📋 Reportes (Admin)</h2>
          <p className="rep-sub">Turno Mañana y Turno Tarde con foto, hora y tardanza.</p>
        </div>

        <div className="rep-actions">
          <select className="rep-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="TODOS">Todos</option>
            <option value="MANANA">Turno Mañana</option>
            <option value="TARDE">Turno Tarde</option>
          </select>

          <button className="rep-refresh" onClick={cargar}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {cargando ? (
        <div className="rep-loading">Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div className="rep-empty">No hay registros para este filtro.</div>
      ) : (
        <div className="rep-grid">
          {filtrados.map((r) => (
            <div className="rep-item" key={r.id || `${r.id_usuario}-${r.fecha}-${r.hora_entrada}`}>
              <div className="rep-photo">
                {r.foto_url ? (
                  /* 2. CONSTRUCCIÓN DE LA URL DE LA FOTO */
                  <img 
                    src={`${API_URL}/fotos_asistencia/${r.foto_url}`} 
                    alt="evidencia" 
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/150?text=Sin+Foto"; 
                    }}
                  />
                ) : (
                  <div className="rep-noimg">Sin foto</div>
                )}
              </div>

              <div className="rep-info">
                <div className="rep-name">{r.nombre_completo || "Empleado"}</div>

                <div className="rep-meta">
                  <span>📅 {r.fecha}</span>
                  <span>🕒 {r.hora_entrada || r.hora_marcada || "-"}</span>
                  <span style={{ textTransform: "capitalize", color: "#666" }}>
                    👤 {r.turno || "Sin turno"}
                  </span>
                </div>

                <div className="rep-badges">
                  <span className={`badge ${Number(r.minutos_tarde) > 0 ? "late" : "ok"}`}>
                    {Number(r.minutos_tarde) > 0 ? `Tarde: ${r.minutos_tarde} min` : "Puntual"}
                  </span>
                  {/* Puedes agregar lógica de descuento aquí si la tienes */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}