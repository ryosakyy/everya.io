/**
 * Authentication API endpoints
 */
import api from './index';

export const authApi = {
    /**
     * Login user with DNI and password
     * @param {string} dni - User DNI
     * @param {string} password - User password
     * @returns {Promise} API response
     */
    login: async (dni, password) => {
        const response = await api.post('/login', {
            dni_usuario: dni,
            password: password
        });
        return response.data;
    }
};

export default authApi;
