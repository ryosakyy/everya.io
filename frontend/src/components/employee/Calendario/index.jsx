/**
 * Employee Calendar Component
 * View personal attendance calendar with statistics
 */
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { attendanceApi } from "../../../api/attendanceApi";
import "./styles.css";

// Helpers
function formatYYYYMMDD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
}

export default function Calendario() {
    const { userId, userName } = useAuth();
    const [cargando, setCargando] = useState(true);
    const [misReportes, setMisReportes] = useState([]);
    const [cursor, setCursor] = useState(new Date());
    const [detalle, setDetalle] = useState(null);

    // Load attendance data
    useEffect(() => {
        const cargar = async () => {
            if (!userId) {
                console.error("⚠️ No user ID found");
                setMisReportes([]);
                setCargando(false);
                return;
            }

            try {
                setCargando(true);
                const data = await attendanceApi.getByUser(userId);
                setMisReportes(Array.isArray(data) ? data : []);
            } catch {
                console.error("Error loading attendance");
                setMisReportes([]);
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, [userId]);

    // Monthly statistics
    const stats = useMemo(() => {
        let total = 0, puntuales = 0, tarde = 0;
        const mesActual = cursor.getMonth();
        const anioActual = cursor.getFullYear();

        misReportes.forEach(r => {
            try {
                const partes = String(r.fecha).split('-');
                const rAnio = parseInt(partes[0]);
                const rMes = parseInt(partes[1]) - 1;

                if (rAnio === anioActual && rMes === mesActual) {
                    total++;
                    if (Number(r.minutos_tarde) > 0) tarde++;
                    else puntuales++;
                }
            } catch { /* ignore */ }
        });
        return { total, puntuales, tarde };
    }, [misReportes, cursor]);

    // Date map for quick lookup
    const mapaFechas = useMemo(() => {
        const m = new Map();
        misReportes.forEach(r => {
            if (r.fecha) {
                const fechaKey = String(r.fecha).substring(0, 10);
                m.set(fechaKey, r);
            }
        });
        return m;
    }, [misReportes]);

    // Calendar grid
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const monthName = cursor.toLocaleDateString("es-ES", { month: "long" });

    const grid = useMemo(() => {
        const first = new Date(year, monthIndex, 1);
        const startWeekday = first.getDay();
        const total = daysInMonth(year, monthIndex);
        const cells = [];

        for (let i = 0; i < startWeekday; i++) cells.push(null);
        for (let d = 1; d <= total; d++) cells.push(new Date(year, monthIndex, d));
        return cells;
    }, [year, monthIndex]);

    const prevMonth = () => setCursor(new Date(year, monthIndex - 1, 1));
    const nextMonth = () => setCursor(new Date(year, monthIndex + 1, 1));

    // Open detail modal
    const abrirDetalle = (dateObj) => {
        const fechaStr = formatYYYYMMDD(dateObj);
        const r = mapaFechas.get(fechaStr);

        let dataModal = { fecha: fechaStr, vacio: true };

        if (r) {
            const url = r.foto_url ? attendanceApi.getPhotoUrl(r.foto_url) : null;
            dataModal = { ...r, fecha: fechaStr, vacio: false, foto_final: url };
        }
        setDetalle(dataModal);
    };

    return (
        <section className="ac-card">
            {/* HEADER */}
            <div className="cal-hero">
                <div className="ac-monthbar">
                    <button onClick={prevMonth} className="cal-navBtn">❮</button>
                    <div className="cal-heroText">
                        <h2>{monthName} {year}</h2>
                        <p>Hola, {userName}</p>
                    </div>
                    <button onClick={nextMonth} className="cal-navBtn">❯</button>
                </div>

                {/* Stats */}
                <div className="cal-stats">
                    <div className="cal-stat">
                        <div className="cal-stat-label">Asistencias</div>
                        <div className="cal-stat-val">{stats.total}</div>
                    </div>
                    <div className="cal-stat">
                        <div className="cal-stat-label">Puntuales</div>
                        <div className="cal-stat-val">{stats.puntuales}</div>
                    </div>
                    <div className="cal-stat" style={{ borderColor: stats.tarde > 0 ? '#fca5a5' : '' }}>
                        <div className="cal-stat-label">Tardanzas</div>
                        <div className="cal-stat-val" style={{ color: stats.tarde > 0 ? '#fca5a5' : 'white' }}>
                            {stats.tarde}
                        </div>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="ac-body">
                {cargando ? (
                    <div className="loading-msg">Cargando tu historial...</div>
                ) : (
                    <>
                        <div className="ac-weekdays">
                            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d, i) => (
                                <span key={i}>{d}</span>
                            ))}
                        </div>

                        <div className="ac-grid">
                            {grid.map((d, idx) => {
                                if (!d) return <div key={idx} className="ac-cell empty" />;

                                const fechaStr = formatYYYYMMDD(d);
                                const r = mapaFechas.get(fechaStr);

                                let statusClass = "";
                                let minTarde = 0;
                                let bgFoto = null;

                                if (r) {
                                    minTarde = Number(r.minutos_tarde || 0);
                                    statusClass = minTarde > 0 ? "late" : "ok";
                                    if (r.foto_url) {
                                        bgFoto = attendanceApi.getPhotoUrl(r.foto_url);
                                    }
                                }

                                return (
                                    <div key={idx} className={`ac-cell ${statusClass}`} onClick={() => abrirDetalle(d)}>
                                        <span className="ac-day-number">{d.getDate()}</span>

                                        {bgFoto && <div className="ac-bg-overlay"><img src={bgFoto} alt="" /></div>}

                                        {r && (
                                            <div className="ac-mini-info">
                                                {minTarde > 0 ? `+${minTarde}m` : "OK"}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* MODAL */}
            {detalle && (
                <div className="ac-modalBack" onClick={() => setDetalle(null)}>
                    <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ac-modalHead">
                            <span className="ac-modalTitle">Detalle del {detalle.fecha}</span>
                            <button className="ac-x" onClick={() => setDetalle(null)}>✕</button>
                        </div>

                        <div className="ac-modalBody">
                            {detalle.vacio ? (
                                <div className="empty-modal">No registraste asistencia este día.</div>
                            ) : (
                                <>
                                    <div className="ac-stats-grid">
                                        <div className="ac-stat-box">
                                            <label>Entrada</label>
                                            <div className="val">{detalle.hora_entrada}</div>
                                        </div>
                                        <div className="ac-stat-box">
                                            <label>Salida</label>
                                            <div className="val">{detalle.hora_salida || "--"}</div>
                                        </div>
                                        <div className="ac-stat-box">
                                            <label>Estado</label>
                                            <div className="val" style={{ color: Number(detalle.minutos_tarde) > 0 ? '#dc2626' : '#16a34a' }}>
                                                {Number(detalle.minutos_tarde) > 0 ? `${detalle.minutos_tarde} min tarde` : 'A tiempo'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ac-photo-container">
                                        {detalle.foto_final ? (
                                            <img src={detalle.foto_final} alt="Evidencia" className="ac-evidence-img" />
                                        ) : <span className="no-photo-text">Sin foto registrada</span>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="ac-modalFooter">
                            <button className="ac-btn-close" onClick={() => setDetalle(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
