/**
 * Admin Payroll Component
 * List all employees and view their payroll details
 */
import { useEffect, useState } from "react";
import { userApi } from "../../../api/userApi";
import Nomina from "../../employee/Nomina";
import "./styles.css";

export default function NominaAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [seleccionado, setSeleccionado] = useState(null);

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                const data = await userApi.getAll();
                // Filter only employees, or show all? Show all
                const lista = Array.isArray(data) ? data : [];
                setUsuarios(lista);
            } catch (err) {
                console.error("Error al cargar usuarios", err);
            } finally {
                setCargando(false);
            }
        };
        cargarUsuarios();
    }, []);

    if (seleccionado) {
        return (
            <div className="na-detail-view">
                <button className="na-back-btn" onClick={() => setSeleccionado(null)}>
                    ← Volver a Lista de Trabajadores
                </button>

                <div className="na-user-info">
                    <h3>Tareo de: {seleccionado.nombre_completo}</h3>
                    <p>DNI: {seleccionado.dni_usuario} | Turno: {seleccionado.turno}</p>
                </div>

                <div className="na-nomina-wrapper">
                    <Nomina targetUser={seleccionado} />
                </div>
            </div>
        );
    }

    return (
        <section className="na-container">
            <h2 className="na-title">💰 Nóminas del Personal</h2>
            <p className="na-subtitle">Selecciona un trabajador para ver su Hoja de Tareo.</p>

            {cargando ? (
                <div className="na-loading">Cargando personal...</div>
            ) : usuarios.length === 0 ? (
                <div className="na-empty">No se encontraron usuarios.</div>
            ) : (
                <div className="na-grid">
                    {usuarios.map((u) => (
                        <div
                            key={u.id}
                            className="na-card"
                            onClick={() => setSeleccionado(u)}
                        >
                            <div className="na-avatar">
                                {u.nombre_completo.charAt(0).toUpperCase()}
                            </div>
                            <div className="na-info">
                                <div className="na-name">{u.nombre_completo}</div>
                                <div className="na-role">{u.rol} • {u.turno}</div>
                                <div className="na-salary">Base: S/{u.sueldo_base || 0}</div>
                            </div>
                            <div className="na-arrow">→</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
