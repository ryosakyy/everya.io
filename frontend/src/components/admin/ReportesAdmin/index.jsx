/**
 * Admin Reports Component
 * View all attendance reports with filters, search, and financial impact
 */
import { useEffect, useState } from "react";
import { attendanceApi } from "../../../api/attendanceApi";
import "./styles.css";

// Helper to calculate deduction
// Helper to calculate deduction
// Logic: Sueldo / 26 dias / 9 horas / 60 minutos
const calcularDescuento = (minutosTarde, sueldoBase = 1200) => {
    const min = Number(minutosTarde);
    if (isNaN(min) || min <= 0) return 0;

    // Formula from Tareo: Base / 26 days / 9 hours / 60 mins
    const valorMinuto = sueldoBase / 26 / 9 / 60;
    return min * valorMinuto;
};

export default function ReportesAdmin() {
    const [cargando, setCargando] = useState(true);
    const [items, setItems] = useState([]);
    const [filtro, setFiltro] = useState("TODOS");
    const [busqueda, setBusqueda] = useState("");

    const cargar = async () => {
        try {
            setCargando(true);
            const data = await attendanceApi.getAllReports();
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

    // Filter logic
    const filtrados = items.filter((r) => {
        // 1. Shift Filter
        if (filtro !== "TODOS") {
            const turnoReal = (r.turno || "manana").toLowerCase();
            if (filtro === "MANANA" && turnoReal !== "manana" && turnoReal !== "mañana") return false;
            if (filtro === "TARDE" && turnoReal !== "tarde") return false;
        }

        // 2. Search Filter
        if (busqueda.trim()) {
            const term = busqueda.toLowerCase();
            const nombre = (r.nombre_completo || "").toLowerCase();
            const dni = (r.dni_usuario || "").toLowerCase();
            if (!nombre.includes(term) && !dni.includes(term)) return false;
        }

        return true;
    });

    return (
        <section className="rep-card">
            <div className="rep-head">
                <div>
                    <h2 className="rep-title">📋 Reportes de Asistencia</h2>
                    <p className="rep-sub">Supervisa asistencias, tardanzas y descuentos.</p>
                </div>

                <div className="rep-actions">
                    <input
                        type="text"
                        className="rep-search"
                        placeholder="🔍 Buscar por nombre o DNI..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />

                    <select className="rep-select" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
                        <option value="TODOS">Todos los turnos</option>
                        <option value="MANANA">Turno Mañana</option>
                        <option value="TARDE">Turno Tarde</option>
                    </select>

                    <button className="rep-refresh" onClick={cargar} title="Actualizar lista">
                        🔄
                    </button>
                </div>
            </div>

            {cargando ? (
                <div className="rep-loading">Cargando datos...</div>
            ) : filtrados.length === 0 ? (
                <div className="rep-empty">
                    {busqueda ? "No hay resultados para tu búsqueda." : "No hay registros disponibles."}
                </div>
            ) : (
                <div className="rep-grid">
                    {filtrados.map((r) => {
                        const dineroPerdido = calcularDescuento(r.minutos_tarde, r.sueldo_base);
                        const isLate = Number(r.minutos_tarde) > 0;

                        return (
                            <div className="rep-item" key={r.id || `${r.id_usuario}-${r.fecha}-${r.hora_entrada}`}>
                                <div className="rep-photo">
                                    {r.foto_url ? (
                                        <img
                                            src={attendanceApi.getPhotoUrl(r.foto_url)}
                                            alt="Evidencia"
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
                                    <div className="rep-top-row">
                                        <div className="rep-name">{r.nombre_completo || "Empleado"}</div>
                                        <div className="rep-dni">{r.dni_usuario}</div>
                                    </div>

                                    <div className="rep-meta-grid">
                                        <div className="rep-meta-box">
                                            <span className="label">Fecha</span>
                                            <span className="value">{r.fecha}</span>
                                        </div>
                                        <div className="rep-meta-box">
                                            <span className="label">Entrada</span>
                                            <span className="value">{r.hora_entrada}</span>
                                        </div>
                                        <div className="rep-meta-box">
                                            <span className="label">Salida</span>
                                            <span className="value">{r.hora_salida || "--:--"}</span>
                                        </div>
                                    </div>

                                    <div className="rep-badges">
                                        <span className={`badge ${isLate ? "late" : "ok"}`}>
                                            {isLate ? `${r.minutos_tarde}m Tarde` : "Puntual"}
                                        </span>

                                        {dineroPerdido > 0 && (
                                            <span className="badge money">
                                                - S/ {dineroPerdido.toFixed(2)}
                                            </span>
                                        )}

                                        <span className="badge shift">{r.turno}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
