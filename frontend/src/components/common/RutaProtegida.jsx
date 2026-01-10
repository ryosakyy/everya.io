/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function RutaProtegida({ children }) {
    const { isAuthenticated, loading } = useAuth();

    // Show nothing while checking auth status
    if (loading) {
        return null;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Render protected content
    return children;
}

export default RutaProtegida;
