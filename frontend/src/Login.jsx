// Archivo: src/Login.jsx

import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { FiLock, FiLogIn, FiUser } from "react-icons/fi";
import "./login.css";

export default function Login() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();

    if (!dni || !password) {
      alert("⚠️ Completa usuario y contraseña.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await axios.post("http://127.0.0.1:5000/login", {
        dni_usuario: dni,
        password: password,
      });

      if (respuesta.data?.success) {
        const u = respuesta.data.usuario || {};

        console.log("✅ Login exitoso. Usuario recibido:", u);

        // 1. Guardamos todo el objeto (necesario para el Calendario)
        localStorage.setItem("usuario", JSON.stringify(u));

        // 2. Guardamos datos sueltos
        localStorage.setItem("usuarioNombre", u.nombre_completo || u.nombre || "Usuario");
        localStorage.setItem("usuarioId", u.id);
        localStorage.setItem("usuarioRol", u.rol || "empleado");

        // 👇👇👇 AQUÍ ESTÁ LA SOLUCIÓN 👇👇👇
        // Si no guardamos esto, el Dashboard muestra "Mañana / Tarde" por error
        localStorage.setItem("usuarioTurno", u.turno); 
        // 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆

        navigate("/dashboard"); 

      } else {
        alert("❌ Error: Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error: Fallo al conectar o credenciales inválidas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logoWrap">
          <img className="auth-logo" src="/logo-everya.png" alt="EVERYA MARKET" />
        </div>

        <h1 className="auth-title">Sistema de Asistencia</h1>
        <p className="auth-subtitle">EVERYA MARKET</p>

        <form onSubmit={manejarLogin} className="auth-form">
          <label className="auth-label">Usuario / DNI</label>
          <div className="auth-inputWrap">
            <FiUser className="auth-icon" />
            <input
              className="auth-input"
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
          </div>

          <label className="auth-label">Contraseña</label>
          <div className="auth-inputWrap">
            <FiLock className="auth-icon" />
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </div>

          <button className="auth-btn" type="submit" disabled={cargando}>
            <FiLogIn />
            {cargando ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}