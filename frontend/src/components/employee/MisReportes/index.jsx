/**
 * Mis Reportes Component (Trabajador)
 * Lista detallada de asistencias para visualización rápida
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { attendanceApi } from "../../../api/attendanceApi";
import { getShiftLabel } from "../../../utils/formatters";
import "./styles.css";

export default function MisReportes() {
    const { userId, userTurno } = useAuth();
    const [reportes, setReportes] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!userId) return;

        attendanceApi.getByUser(userId)
            .then(data => {
                // Ordenar por fecha descendente (más reciente primero)
                const sorted = (Array.isArray(data) ? data : []).sort((a, b) =>
                    new Date(b.fecha) - new Date(a.fecha)
                );
                setReportes(sorted);
            })
            .catch(err => console.error(err))
            .finally(() => setCargando(false));
    }, [userId]);

    const turnoLabel = getShiftLabel(userTurno);

    if (cargando) return <div className="mr-loading">Cargando reporte...</div>;

    return (
        <section className="mr-container">
            <div className="mr-header">
                <h2 className="mr-title">Mis Asistencias</h2>
                <span className="mr-badge-turno">{turnoLabel}</span>
            </div>

            {reportes.length === 0 ? (
                <div className="mr-empty">
                    <p>No tienes registros de asistencia aún.</p>
                </div>
            ) : (
                <div className="mr-list">
                    {reportes.map((r) => {
                        const tarde = Number(r.minutos_tarde || 0);
                        const isLate = tarde > 0;
                        const dateObj = new Date(r.fecha);

                        return (
                            <div key={r.id_asistencia} className={`mr-card ${isLate ? 'late' : 'ontime'}`}>
                                <div className="mr-date-box">
                                    <span className="mr-day">{dateObj.getDate()}</span>
                                    <span className="mr-month">
                                        {dateObj.toLocaleDateString("es-ES", { month: "short" })}
                                    </span>
                                </div>

                                <div className="mr-info">
                                    <div className="mr-row">
                                        <span className="mr-label">Entrada:</span>
                                        <span className="mr-val">{r.hora_entrada}</span>
                                    </div>
                                    <div className="mr-row">
                                        <span className="mr-label">Salida:</span>
                                        <span className="mr-val">{r.hora_salida || "--:--"}</span>
                                    </div>
                                </div>

                                <div className="mr-status">
                                    {isLate ? (
                                        <span className="status-badge late">+{tarde} min</span>
                                    ) : (
                                        <span className="status-badge ok">Puntual</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
