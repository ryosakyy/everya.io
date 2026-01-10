/**
 * Dashboard Page Component
 * Main dashboard for employees and admins
 */
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/AuthContext";
import { attendanceApi } from "../api/attendanceApi";
import { getShiftLabel } from "../utils/formatters";
import "../styles/dashboard.css";

// Employee components
import Calendario from "../components/employee/Calendario";
import Nomina from "../components/employee/Nomina";
import MisReportes from "../components/employee/MisReportes";

// Admin components
import AdminCalendarios from "../components/admin/AdminCalendarios";
import CrearEmpleadosAdmin from "../components/admin/CrearEmpleados";
import ReportesAdmin from "../components/admin/ReportesAdmin";
import NominaAdmin from "../components/admin/NominaAdmin";

function Dashboard() {
  const { userName, userId, isAdmin, userTurno, logout } = useAuth();
  const webcamRef = useRef(null);

  const [tab, setTab] = useState(isAdmin ? "reportes" : "marcar");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // Set correct tab when admin status loads
  useEffect(() => {
    setTab(isAdmin ? "reportes" : "marcar");
  }, [isAdmin]);

  const turnoTexto = getShiftLabel(userTurno, isAdmin);

  const registrarAsistencia = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      alert("⚠️ La cámara está cargando, espera un segundo...");
      return;
    }
    if (!userId || Number.isNaN(userId)) {
      alert("⚠️ No se encontró el ID del usuario. Vuelve a iniciar sesión.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const data = await attendanceApi.mark(userId, imageSrc);

      if (data?.success) {
        const tipo = data.tipo || data.tipo_marcaje || "";
        const texto = tipo
          ? `✅ ${tipo}: ${data.mensaje} (🕒 ${data.hora_servidor || ""})`
          : `✅ ${data.mensaje}`;

        setMensaje(texto);
        alert(texto);
      } else {
        const msg = data?.mensaje || "No se pudo marcar asistencia.";
        setMensaje(msg);
        alert(`⚠️ ${msg}`);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setMensaje("❌ Error desconocido");
      alert("❌ Error desconocido");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setMensaje("");
  }, [tab]);

  return (
    <div className="dash-page">
      {/* HEADER */}
      <header className="dash-header">
        <div className="dash-user">
          <div className="dash-avatar">
            <img src="/logo-everya.png" alt="EVERYA" />
          </div>

          <div className="dash-user-text">
            <div className="dash-user-name">{userName}</div>
            <div className="dash-user-shift">{turnoTexto}</div>
          </div>
        </div>

        <button className="dash-logout" onClick={logout}>
          <span className="dash-logout-icon">↩</span>
          <span>Salir</span>
        </button>
      </header>

      {/* TABS */}
      <nav className="dash-tabs">
        {/* Employee Tabs */}
        {!isAdmin && (
          <>
            <button
              className={`dash-tab ${tab === "marcar" ? "active" : ""}`}
              onClick={() => setTab("marcar")}
            >
              <span className="tab-icon">📸</span> Marcar
            </button>

            <button
              className={`dash-tab ${tab === "calendario" ? "active" : ""}`}
              onClick={() => setTab("calendario")}
            >
              <span className="tab-icon">📅</span> Calendario
            </button>

            <button
              className={`dash-tab ${tab === "mis-reportes" ? "active" : ""}`}
              onClick={() => setTab("mis-reportes")}
            >
              <span className="tab-icon">📋</span> Reportes
            </button>


          </>
        )}

        {/* Admin Tabs */}
        {isAdmin && (
          <>
            <button
              className={`dash-tab ${tab === "reportes" ? "active" : ""}`}
              onClick={() => setTab("reportes")}
            >
              <span className="tab-icon">📋</span> Reportes
            </button>

            <button
              className={`dash-tab ${tab === "calendarios" ? "active" : ""}`}
              onClick={() => setTab("calendarios")}
            >
              <span className="tab-icon">📅</span> Calendarios
            </button>

            <button
              className={`dash-tab ${tab === "empleados" ? "active" : ""}`}
              onClick={() => setTab("empleados")}
            >
              <span className="tab-icon">👥</span> Empleados
            </button>

            <button
              className={`dash-tab ${tab === "admin-nominas" ? "active" : ""}`}
              onClick={() => setTab("admin-nominas")}
            >
              <span className="tab-icon">💰</span> Nóminas
            </button>
          </>
        )}
      </nav>

      {/* CONTENT */}
      <main className="dash-main">
        {/* Employee Content */}
        {!isAdmin && tab === "marcar" && (
          <section className="dash-card">
            <div className="dash-card-icon">📸</div>

            <h2 className="dash-card-title">Marcar Asistencia</h2>
            <p className="dash-card-subtitle">Encuadra tu rostro antes de marcar.</p>

            <div className="dash-divider" />

            <div className="dash-camera-wrap">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{ facingMode: "user" }}
              />
            </div>

            <button className="dash-action" onClick={registrarAsistencia} disabled={cargando}>
              {cargando ? "Procesando..." : "📸 Registrar Asistencia"}
            </button>

            {mensaje && <div className="dash-msg">{mensaje}</div>}
          </section>
        )}

        {!isAdmin && tab === "calendario" && <Calendario />}
        {!isAdmin && tab === "mis-reportes" && <MisReportes />}

        {/* Admin Content */}
        {isAdmin && tab === "reportes" && <ReportesAdmin />}
        {isAdmin && tab === "calendarios" && <AdminCalendarios />}
        {isAdmin && tab === "empleados" && <CrearEmpleadosAdmin />}
        {isAdmin && tab === "admin-nominas" && <NominaAdmin />}
      </main>

      <button className="dash-help" title="Ayuda">
        ?
      </button>
    </div>
  );
}

export default Dashboard;