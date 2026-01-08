import axios from "axios";
import { useEffect, useMemo, useState } from "react";
// IMPORTANTE: El nombre coincide con tu captura de pantalla
import "./AdminCalendarios.css";

function formatYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminCalendarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState("");
  const [reportes, setReportes] = useState([]);
  
  // Estado del calendario y modal
  const [cursor, setCursor] = useState(new Date());
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("TODOS"); // Filtros: TODOS | MANANA | TARDE

  const API_URL = "http://127.0.0.1:5000";

  // 1. Cargar Usuarios para el Select
  useEffect(() => {
    axios.get(`${API_URL}/admin/usuarios`)
      .then(res => setUsuarios(res.data))
      .catch(err => console.error("Error cargando usuarios:", err));
  }, []);

  // 2. Cargar Asistencias cuando cambia el usuario seleccionado
  useEffect(() => {
    if (usuarioSeleccionado) {
      axios.get(`${API_URL}/asistencias/usuario/${usuarioSeleccionado}`)
        .then(res => setReportes(res.data || []))
        .catch(err => console.error("Error cargando asistencias:", err));
    } else {
      setReportes([]);
    }
  }, [usuarioSeleccionado]);

  // 3. Filtrar reportes (Mañana vs Tarde)
  const reportesFiltrados = useMemo(() => {
    if (filtro === "TODOS") return reportes;
    return reportes.filter(r => {
      if (!r.hora_entrada) return false;
      const hora = parseInt(r.hora_entrada.split(":")[0], 10);
      if (filtro === "MANANA") return hora < 13;
      if (filtro === "TARDE") return hora >= 13;
      return true;
    });
  }, [reportes, filtro]);

  // Mapa de fechas para búsqueda rápida
  const mapFechas = useMemo(() => {
    const m = new Map();
    reportesFiltrados.forEach(r => m.set(r.fecha, r));
    return m;
  }, [reportesFiltrados]);

  // Generar los días del mes actual
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const diasMes = useMemo(() => {
    const total = new Date(year, month + 1, 0).getDate();
    const start = new Date(year, month, 1).getDay();
    const cells = Array(start).fill(null);
    for(let i=1; i<=total; i++) cells.push(new Date(year, month, i));
    return cells;
  }, [year, month]);

  // Ver Detalle (Modal)
  const verDetalle = (date) => {
    const f = formatYYYYMMDD(date);
    const data = mapFechas.get(f);
    
    let foto = null;
    if (data && data.foto_url) {
        foto = `${API_URL}/fotos_asistencia/${data.foto_url}`;
    }
    setDetalle({ fecha: f, data, foto });
  };

  return (
    <div className="cal-container">
      <h2 className="cal-title">📅 Calendario de Asistencia</h2>
      
      {/* Controles de Selección */}
      <div className="cal-controls">
        <select 
            className="cal-select"
            value={usuarioSeleccionado} 
            onChange={(e) => setUsuarioSeleccionado(e.target.value)}
        >
            <option value="">-- Seleccionar Empleado --</option>
            {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                    {u.nombre_completo}
                </option>
            ))}
        </select>

        <select className="cal-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="TODOS">Todos los Turnos</option>
            <option value="MANANA">Solo Mañana</option>
            <option value="TARDE">Solo Tarde</option>
        </select>
      </div>

      {/* Navegación Mes */}
      <div className="cal-header">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))}>❮</button>
        <h3>{cursor.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))}>❯</button>
      </div>

      {!usuarioSeleccionado && <p className="cal-msg">Selecciona un empleado para ver sus registros.</p>}

      {/* GRILLA DEL CALENDARIO */}
      <div className="cal-grid">
        {/* CORRECCIÓN AQUI: Usamos el indice 'i' como key para evitar error de claves duplicadas (M, M) */}
        {["D","L","M","M","J","V","S"].map((d, i) => (
            <div key={i} className="cal-head-day">{d}</div>
        ))}
        
        {diasMes.map((d, i) => {
           if(!d) return <div key={i} className="cal-cell empty"></div>;
           
           const f = formatYYYYMMDD(d);
           const r = mapFechas.get(f);
           let clase = "cal-cell";
           if(r) clase += r.minutos_tarde > 0 ? " late" : " ok";

           return (
             <div key={i} className={clase} onClick={() => verDetalle(d)}>
               <span>{d.getDate()}</span>
             </div>
           );
        })}
      </div>

      {/* MODAL CON FOTO */}
      {detalle && (
        <div className="modal-back" onClick={() => setDetalle(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <h4>Registro del: {detalle.fecha}</h4>
                {detalle.data ? (
                    <div className="modal-content">
                        <p><strong>Entrada:</strong> {detalle.data.hora_entrada}</p>
                        <p><strong>Salida:</strong> {detalle.data.hora_salida || "--"}</p>
                        <p style={{color: detalle.data.minutos_tarde > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold'}}>
                           Tardanza: {detalle.data.minutos_tarde} min
                        </p>
                        <div className="modal-photo">
                             {detalle.foto ? (
                                <img src={detalle.foto} alt="Evidencia Asistencia" />
                             ) : <div className="no-photo">Sin Foto Registrada</div>}
                        </div>
                    </div>
                ) : <p>No hay asistencia registrada este día.</p>}
                <button className="modal-close-btn" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
        </div>
      )}
    </div>
  );
}