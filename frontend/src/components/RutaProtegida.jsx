// Archivo: src/components/RutaProtegida.jsx
import { Navigate } from "react-router-dom";

export const RutaProtegida = ({ children }) => {
  // Verificamos si existe el ID del usuario en el navegador
  const usuarioId = localStorage.getItem("usuarioId");

  // Si NO hay usuario logueado, redirigir al Login ("/")
  if (!usuarioId) {
    return <Navigate to="/" replace />;
  }

  // Si SÍ hay usuario, mostrar el contenido (Dashboard)
  return children;
};