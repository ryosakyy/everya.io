import { useEffect, useState } from 'react';

const ReportesAdmin = () => {
    const [asistencias, setAsistencias] = useState([]);

    // ⚠️ URL DE RAILWAY
    const API_URL = "https://everyaio-production.up.railway.app";

    useEffect(() => {
        // ✅ CORREGIDO: Petición al servidor en la nube
        fetch(`${API_URL}/reportes`)
            .then(res => res.json())
            .then(data => {
                // Aseguramos que sea un array para evitar errores
                if(Array.isArray(data)) setAsistencias(data);
                else setAsistencias([]);
            })
            .catch(err => console.error("Error cargando reportes:", err));
    }, []);

    return (
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <h2>📊 Reporte General</h2>
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead style={{ background: '#222', color: 'white' }}>
                    <tr>
                        <th>Fecha</th>
                        <th>Empleado</th>
                        <th>Entrada</th>
                        <th>Salida</th>
                        <th>Tardanza</th>
                        <th>Foto</th>
                    </tr>
                </thead>
                <tbody>
                    {asistencias.map((reg) => (
                        <tr key={reg.id}>
                            <td>{reg.fecha}</td>
                            <td>{reg.nombre_completo}</td>
                            <td>{reg.hora_entrada}</td>
                            <td>{reg.hora_salida || "--"}</td>
                            <td style={{ color: reg.minutos_tarde > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                {reg.minutos_tarde} min
                            </td>
                            <td>
                                {reg.foto_url && (
                                    // ✅ CORREGIDO: Enlace a la foto en la nube
                                    <a href={`${API_URL}/fotos_asistencia/${reg.foto_url}`} target="_blank" rel="noreferrer">
                                        Ver
                                    </a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportesAdmin;