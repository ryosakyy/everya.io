/**
 * Login Page Component
 * Handles user authentication
 */
import { useState } from "react";
import { FiLock, FiLogIn, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();

  const manejarLogin = async (e) => {
    e.preventDefault();

    if (!dni || !password) {
      alert("⚠️ Completa usuario y contraseña.");
      return;
    }

    try {
      setCargando(true);
      const result = await login(dni, password);

      if (!result.success) {
        alert(`❌ Error: ${result.message}`);
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