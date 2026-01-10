/**
 * Employee Payroll Component (Nomina)
 * Advanced calculation based on "Tareo" logic
 * Formula: Salary / 26 days / 9 hours
 */
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { attendanceApi } from "../../../api/attendanceApi";
import "./styles.css";

// Constants from User Request
const DIAS_LABORABLES = 26;
const HORAS_DIARIAS = 9;

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Nomina({ targetUser }) {
    const { user: authUser, isAuthenticated } = useAuth();
    // Helper to allow admin to see other users, or default to self (though self access is removed for now)
    const currentUser = targetUser || authUser;

    const [datos, setDatos] = useState({
        mesTexto: "Cargando...",
        anio: new Date().getFullYear(),
        periodoTexto: "",
        sueldoBase: 850,

        // Unit values
        gananciaDia: 0,
        gananciaHora: 0,
        gananciaMinuto: 0,

        // Totals for "Tareo" column
        totalDias: 0,
        totalMinutos: 0, // Sum of effective minutes

        // Calculation variables
        totalMinutosTeoricos: 0,
        diasTrabajados: 0,
        minutosRetraso: 0,

        // Final
        totalPagar: 0,

        // Detail list
        diasDetalle: []
    });

    const [loading, setLoading] = useState(true);

    // EXPORT FUNCTIONS
    const exportarExcel = () => {
        try {
            const wb = XLSX.utils.book_new();

            // Header Info
            const info = [
                ["EMPRESA", "EVERYA MARKET S.R.L.", "", "PERIODO", datos.periodoTexto],
                ["RUC", "20614382725", "", "FECHA", new Date().toLocaleDateString()],
                ["TARIFA MENSUAL", datos.sueldoBase.toFixed(2), "", "MES", datos.mesTexto],
                ["SERVICIO", currentUser?.rol || "Ventas", "", "", ""]
            ];

            // Table Data
            const headers = ["N°", "FECHA", "TURNO", "PERSONAL", "TOTAL DÍAS", "TOTAL HORAS", "TOTAL MINUTOS", "TARDANZA (Min)"];
            const rows = datos.diasDetalle.map(d => [
                d.num, d.fechaFmt, d.turno, d.personal, d.dias, d.horas, d.minutos, d.minutosTarde
            ]);

            // Footer Summary
            const summary = [
                ["", "", "", "TOTALES", datos.diasTrabajados, "", datos.totalMinutos, datos.minutosRetraso],
                [],
                ["RESUMEN DE PAGO"],
                ["DESCRIPCIÓN", "TAREO", "COSTO UNITARIO", "TOTAL S/.", "MINUTOS RETRASO", "A PAGAR"],
                ["TOTAL DÍAS", datos.totalDias, datos.gananciaDia.toFixed(2), datos.sueldoBase.toFixed(2), datos.minutosRetraso, datos.totalPagar.toFixed(2)],
                ["TOTAL MINUTOS", datos.totalMinutos, datos.gananciaMinuto.toFixed(2), datos.sueldoBase.toFixed(2)]
            ];

            const wsData = [...info, [], headers, ...rows, ...summary];
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, "Tareo");

            // Sanitize filename
            const safeName = (currentUser?.nombre_completo || "Trabajador").replace(/[^a-zA-Z0-9]/g, "_");
            XLSX.writeFile(wb, `Tareo_${safeName}_${datos.mesTexto}.xlsx`);
        } catch (error) {
            console.error("Export Excel Error:", error);
            alert("Error al exportar Excel. Ver consola.");
        }
    };

    const exportarPDF = () => {
        try {
            const doc = new jsPDF();

            // Brand / Header
            doc.setFontSize(10);
            doc.text("EMPRESA: EVERYA MARKET S.R.L.", 14, 15);
            doc.text("RUC: 20614382725", 14, 20);
            doc.text(`TARIFA: S/${datos.sueldoBase.toFixed(2)}`, 14, 25);
            doc.text(`PERSONAL: ${currentUser?.nombre_completo || 'PERSONAL'}`, 14, 30);

            doc.text(`PERIODO: ${datos.periodoTexto}`, 120, 15);
            doc.text(`FECHA: ${new Date().toLocaleDateString()}`, 120, 20);

            // Main Table using functional autoTable
            autoTable(doc, {
                startY: 40,
                head: [['N°', 'FECHA', 'TURNO', 'PERSONAL', 'DÍAS', 'HORAS', 'MINUTOS']],
                body: datos.diasDetalle.map(d => [
                    d.num, d.fechaFmt, d.turno, d.personal, d.dias, d.horas, d.minutos
                ]),
                theme: 'grid',
                headStyles: { fillColor: [216, 188, 245], textColor: [0, 0, 0] }, // Purple
                styles: { fontSize: 8, halign: 'center' }
            });

            // Summary Tables
            // @ts-ignore
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80;

            // Unit Costs
            autoTable(doc, {
                startY: finalY,
                head: [['Concepto', 'Monto']],
                body: [
                    ['Ganancia Día', `S/${datos.gananciaDia.toFixed(2)}`],
                    ['Ganancia Hora', `S/${datos.gananciaHora.toFixed(2)}`],
                    ['Ganancia Minuto', `S/${datos.gananciaMinuto.toFixed(2)}`],
                ],
                theme: 'grid',
                tableWidth: 80,
                headStyles: { fillColor: [216, 188, 245], textColor: [0, 0, 0] },
                margin: { left: 14 }
            });

            // Final Calculation
            autoTable(doc, {
                startY: finalY,
                head: [['Descripción', 'Tareo', 'Costo Unit.', 'Total S/.', 'Retraso', 'A Pagar']],
                body: [
                    ['TOTAL DÍAS', datos.totalDias, datos.gananciaDia.toFixed(2), datos.sueldoBase.toFixed(2), datos.minutosRetraso, `S/${datos.totalPagar.toFixed(2)}`],
                    ['TOTAL MINUTOS', datos.totalMinutos, datos.gananciaMinuto.toFixed(2), datos.sueldoBase.toFixed(2), '', '']
                ],
                theme: 'grid',
                tableWidth: 100,
                headStyles: { fillColor: [216, 188, 245], textColor: [0, 0, 0] },
                margin: { left: 100 }
            });

            const safeName = (currentUser?.nombre_completo || "Trabajador").replace(/[^a-zA-Z0-9]/g, "_");
            doc.save(`Tareo_${safeName}.pdf`);
        } catch (error) {
            console.error("Export PDF Error:", error);
            alert("Error al exportar PDF. Ver consola.");
        }
    };

    useEffect(() => {
        const calcularNomina = async () => {
            try {
                // 1. Base Salary & Constants
                // If user has specific salary, use it, otherwise 850
                const sueldoBase = currentUser?.sueldo_base ? Number(currentUser.sueldo_base) : 850;

                // Exact logic from image:
                // Ganancia dia = 850 / 26 = 32.69
                // Ganancia hora = 32.69 / 9 = 3.63
                // Ganancia minuto = 3.63 / 60 = 0.06

                const gananciaDia = sueldoBase / DIAS_LABORABLES;
                const gananciaHora = gananciaDia / HORAS_DIARIAS;
                const gananciaMinuto = gananciaHora / 60;

                // 2. Fetch Reports
                const reports = await attendanceApi.getAllReports();
                const miDNI = currentUser ? String(currentUser.dni_usuario || "") : "";

                const hoy = new Date();
                const mesActual = hoy.getMonth();
                const anioActual = hoy.getFullYear();

                // Start date assumption: The image shows "14/11 al 19/12". 
                // For this implementation, we will stick to "Current Month" filtering for simplicity 
                // unless we want a specific date picker. Let's stick to current month for now.
                const asistenciasMes = reports.filter(r => {
                    const rDate = new Date(r.fecha);
                    const isMyUser = String(r.dni_usuario) === miDNI;
                    return isMyUser && rDate.getMonth() === mesActual && rDate.getFullYear() === anioActual;
                });

                // 3. Process Rows
                let diasTrabajados = 0;
                let minutosRetraso = 0;
                let totalMinutosEfectivos = 0;

                const detalle = asistenciasMes.map((r, index) => {
                    const minTarde = Number(r.minutos_tarde || 0);

                    // Logic from image: 
                    // Standard minutes = 9 * 60 = 540
                    // "Total Minutos Por Día" = 540 - Tardanza
                    const minutosDia = (HORAS_DIARIAS * 60) - minTarde;

                    diasTrabajados++;
                    minutosRetraso += minTarde;
                    totalMinutosEfectivos += minutosDia;

                    // Format date like "14-Nov"
                    const dObj = new Date(r.fecha);
                    // Manually formatting to match "DD-MMM" Spanish abbreviated
                    const day = dObj.getDate();
                    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    const month = months[dObj.getMonth()];
                    const fechaFmt = `${day}-${month}`;

                    return {
                        num: index + 1,
                        fechaFmt: fechaFmt,
                        fechaFull: r.fecha,
                        turno: r.turno || "COMPLETO", // In image it says "COMPLETO"
                        personal: currentUser?.nombre_completo || "PERSONAL",
                        dias: 1, // "Total Días Efectivas" is always 1 per row in image
                        horas: 9, // "Total Horas Efectivas" is 9 (if not absent?)
                        minutos: minutosDia,
                        minutosTarde: minTarde
                    };
                }).sort((a, b) => new Date(a.fechaFull) - new Date(b.fechaFull));

                // 4. Final Totals
                // The image logic for "Total A Pagar":
                // Option A: Total S/. (850) - (Minutos Retraso * Costo Minuto)
                // Let's verify with image data: 850 - (64 * 0.0605..) = 846.13. Matches.

                // Total calculation:
                // Base Salary - (Late Minutes * Minute Rate)
                const descuento = minutosRetraso * gananciaMinuto;
                const aPagar = sueldoBase - descuento;

                // For the "Tareo" box:
                // Total Días = 26 (Fixed or actual worked? Image shows 26 in summary, but listed rows might be less if partial period)
                // Image lists 36 rows? No, image rows are 1..36 but only filled for working days.
                // The summary "Total Días" column says 26.
                // We should probably show "Dias Laborables: 26" as fixed.

                // Total Minutos: 26 * 540 = 14040.
                const totalMinutosBase = DIAS_LABORABLES * HORAS_DIARIAS * 60;

                const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

                setDatos({
                    mesTexto: meses[mesActual],
                    anio: anioActual,
                    periodoTexto: `${meses[mesActual]} ${anioActual}`,
                    sueldoBase,
                    gananciaDia,
                    gananciaHora,
                    gananciaMinuto,

                    totalDias: DIAS_LABORABLES, // Fixed 26
                    totalMinutos: totalMinutosBase, // Fixed 14040 for full salary base

                    diasTrabajados: diasTrabajados,
                    minutosRetraso: minutosRetraso,

                    totalPagar: aPagar,
                    diasDetalle: detalle
                });

            } catch (err) {
                console.error("Error calculating payroll", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            calcularNomina();
        }
    }, [currentUser]);

    if (loading) return <div className="nom-loading">Calculando nómina...</div>;

    return (
        <section className="nom-container">
            {/* Header / Info Block */}
            <div className="nom-top-info">
                <div className="nom-info-row">
                    <span className="label">EMPRESA</span>
                    <span className="value">EVERYA MARKET S.R.L.</span>
                </div>
                <div className="nom-info-row">
                    <span className="label">RUC</span>
                    <span className="value">20614382725</span>
                </div>
                <div className="nom-info-row">
                    <span className="label">TARIFA MENSUAL</span>
                    <span className="value">{datos.sueldoBase.toFixed(2)}</span>
                </div>
                <div className="nom-info-row">
                    <span className="label">SERVICIO</span>
                    <span className="value">{currentUser.rol || "Ventas y atención al cliente"}</span>
                </div>

                <div className="nom-info-right">
                    <div className="nom-info-row">
                        <span className="label">PERIODO</span>
                        <span className="value">{datos.periodoTexto}</span>
                    </div>
                    <div className="nom-info-row">
                        <span className="label">FECHA</span>
                        <span className="value">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="nom-actions">
                <button className="btn-export excel" onClick={exportarExcel}>
                    📊 Descargar Excel
                </button>
                <button className="btn-export pdf" onClick={exportarPDF}>
                    📄 Descargar PDF
                </button>
            </div>

            {/* Main Table */}
            <div className="nom-table-wrapper">
                <table className="nom-table-main">
                    <thead>
                        <tr>
                            <th className="th-purple">N°</th>
                            <th className="th-purple">FECHA</th>
                            <th className="th-purple">TURNO</th>
                            <th className="th-purple">PERSONAL</th>
                            <th className="th-purple">TOTAL DÍAS<br />EFECTIVAS</th>
                            <th className="th-purple">TOTAL<br />HORAS<br />EFECTIVAS</th>
                            <th className="th-purple">TOTAL<br />MINUTOS<br />POR DÍA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.diasDetalle.map((row, i) => (
                            <tr key={i}>
                                <td>{row.num}</td>
                                <td>{row.fechaFmt}</td>
                                <td>{row.turno}</td>
                                <td>{row.personal}</td>
                                <td>{row.dias}</td>
                                <td>{row.horas}</td>
                                <td>{row.minutos}</td>
                            </tr>
                        ))}
                        {/* If no data, show empty row? */}
                        {datos.diasDetalle.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No hay registros este mes</td></tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="tr-footer">
                            <td colSpan="4"></td>
                            <td>{datos.diasTrabajados}</td>
                            <td>{/* Sum hours? */}</td>
                            <td>{/* Sum minutes? */}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Bottom Section: Unit Cost + Final Summary */}
            <div className="nom-bottom-layout">
                {/* Left: Unit Costs */}
                <div className="nom-unit-table-container">
                    <table className="nom-unit-table">
                        <tbody>
                            <tr>
                                <td className="bg-purple">Ganancia por día</td>
                                <td>{datos.gananciaDia.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bg-purple">Ganancia por hora</td>
                                <td>{datos.gananciaHora.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bg-purple">Ganancia por minuto</td>
                                <td>{datos.gananciaMinuto.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Right: Summary "Tareo" Box */}
                <div className="nom-summary-container">
                    <table className="nom-summary-table">
                        <thead>
                            <tr>
                                <th className="bg-purple">DESCRIPCIÓN</th>
                                <th className="bg-purple">TAREO</th>
                                <th className="bg-purple">COSTO UNITARIO</th>
                                <th className="bg-purple">TOTAL S/.</th>
                                <th className="bg-purple">MINUTOS DE<br />RETRASO</th>
                                <th className="bg-purple">TOTAL A<br />PAGAR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="bg-gray">TOTAL DÍAS</td>
                                <td>{datos.totalDias}</td>
                                <td>{datos.gananciaDia.toFixed(2)}</td>
                                <td>{datos.sueldoBase.toFixed(2)}</td>
                                <td rowSpan="2" className="cell-large">{datos.minutosRetraso}</td>
                                <td rowSpan="2" className="cell-large">{datos.totalPagar.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="bg-gray">TOTAL MINUTOS</td>
                                <td>{datos.totalMinutos}</td>
                                <td>{datos.gananciaMinuto.toFixed(2)}</td>
                                <td>{datos.sueldoBase.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="nom-branding">
                {/* Optional logo or text if needed */}
                <p>EVERYA</p>
            </div>
        </section>
    );
}
