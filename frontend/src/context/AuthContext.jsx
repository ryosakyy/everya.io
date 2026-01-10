/**
 * Authentication Context
 * Manages user authentication state globally
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

// Create context
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the app and provides auth state and methods
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.clear();
            }
        }
        setLoading(false);
    }, []);

    /**
     * Login function
     * @param {string} dni - User DNI
     * @param {string} password - User password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = useCallback(async (dni, password) => {
        try {
            const response = await authApi.login(dni, password);

            if (response?.success) {
                const userData = response.usuario || {};

                // Save to localStorage for persistence
                localStorage.setItem('usuario', JSON.stringify(userData));
                localStorage.setItem('usuarioId', userData.id);
                localStorage.setItem('usuarioNombre', userData.nombre_completo || userData.nombre || 'Usuario');
                localStorage.setItem('usuarioRol', userData.rol || 'empleado');
                localStorage.setItem('usuarioTurno', userData.turno || '');

                setUser(userData);
                navigate('/dashboard');
                return { success: true };
            }

            return { success: false, message: 'Usuario o contraseña incorrectos' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Error al conectar con el servidor' };
        }
    }, [navigate]);

    /**
     * Logout function
     * Clears user data and redirects to login
     */
    const logout = useCallback(() => {
        localStorage.clear();
        setUser(null);
        navigate('/');
    }, [navigate]);

    // Computed values
    const isAuthenticated = !!user;
    const isAdmin = user?.rol === 'admin';
    const userId = user?.id;
    const userName = user?.nombre_completo || user?.nombre || 'Usuario';
    const userTurno = user?.turno || '';

    // Context value
    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        userId,
        userName,
        userTurno,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to use authentication context
 * @returns {Object} Auth context value
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
