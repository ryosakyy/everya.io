// Archivo: src/Dashboard.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

import "./dashboard.css";

// ✅ EMPLEADO
import Calendario from "./components/Calendario";
import Nomina from "./components/Nomina";

// ✅ ADMIN
import AdminCalendarios from "./components/AdminCalendarios";
import CrearEmpleadosAdmin from "./components/CrearEmpleadosAdmin";
import ReportesAdmin from "./components/ReportesAdmin";

function Dashboard() {
  const navigate = useNavigate();

  // 👇 SEGURIDAD EXTRA: Si no hay ID, expulsar inmediatamente 👇
  useEffect(() => {
    if (!localStorage.getItem("usuarioId")) {
      navigate("/");
    }
  }, [navigate]);
  // 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆

  const usuarioNombre = localStorage.getItem("usuarioNombre") || "Usuario";
  const usuarioIdRaw = localStorage.getItem("usuarioId");
  const usuarioId = Number(usuarioIdRaw);

  // ✅ Rol guardado desde Login.jsx
  const usuarioRol = localStorage.getItem("usuarioRol") || "empleado";
  const esAdmin = usuarioRol === "admin";

  // ✅ Turno (solo empleado)
  const usuarioTurno = localStorage.getItem("usuarioTurno") || ""; // manana | tarde

  const webcamRef = useRef(null);

  const [tab, setTab] = useState("marcar");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  // ✅ Cuando cargue esAdmin, setea tab correcto
  useEffect(() => {
    setTab(esAdmin ? "reportes" : "marcar");
  }, [esAdmin]);

  const turnoTexto = esAdmin
    ? "Administrador"
    : usuarioTurno === "manana"
    ? "Turno Mañana (9:00 AM - 3:00 PM)"
    : usuarioTurno === "tarde"
    ? "Turno Tarde (3:00 PM - 9:00 PM)"
    : "Turno Mañana / Tarde";

  const cerrarSesion = () => {
    localStorage.clear(); // Borra las llaves de seguridad
    navigate("/");
  };

  const registrarAsistencia = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      alert("⚠️ La cámara está cargando, espera un segundo...");
      return;
    }
    if (!usuarioId || Number.isNaN(usuarioId)) {
      alert("⚠️ No se encontró el ID del usuario. Vuelve a iniciar sesión.");
      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const res = await fetch("http://127.0.0.1:5000/marcar_asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuarioId, foto: imageSrc }),
      });

      const data = await res.json();

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
      console.error("Error al marcar asistencia:", error);
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
            <div className="dash-user-name">{usuarioNombre}</div>
            <div className="dash-user-shift">{turnoTexto}</div>
          </div>
        </div>

        <button className="dash-logout" onClick={cerrarSesion}>
          <span className="dash-logout-icon">↩</span>
          <span>Salir</span>
        </button>
      </header>

      {/* TABS */}
      <nav className="dash-tabs">
        {/* ✅ EMPLEADO */}
        {!esAdmin && (
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
              className={`dash-tab ${tab === "nomina" ? "active" : ""}`}
              onClick={() => setTab("nomina")}
            >
              <span className="tab-icon">💲</span> Nómina
            </button>
          </>
        )}

        {/* ✅ ADMIN */}
        {esAdmin && (
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
          </>
        )}
      </nav>

      {/* CONTENIDO */}
      <main className="dash-main">
        {/* ✅ EMPLEADO */}
        {!esAdmin && tab === "marcar" && (
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

        {!esAdmin && tab === "calendario" && <Calendario />}
        {!esAdmin && tab === "nomina" && <Nomina />}

        {/* ✅ ADMIN */}
        {esAdmin && tab === "reportes" && <ReportesAdmin />}
        {esAdmin && tab === "calendarios" && <AdminCalendarios />}
        {esAdmin && tab === "empleados" && <CrearEmpleadosAdmin />}
      </main>

      <button className="dash-help" title="Ayuda">
        ?
      </button>
    </div>
  );
}

export default Dashboard;