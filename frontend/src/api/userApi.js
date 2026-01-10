/**
 * User management API endpoints
 */
import api from './index';

export const userApi = {
    /**
     * Get all users (admin only)
     * @returns {Promise} List of users
     */
    getAll: async () => {
        const response = await api.get('/admin/usuarios');
        return response.data;
    },

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise} API response
     */
    create: async (userData) => {
        const response = await api.post('/admin/usuarios', userData);
        return response.data;
    },

    /**
     * Delete a user
     * @param {number} userId - User ID to delete
     * @returns {Promise} API response
     */
    delete: async (userId) => {
        const response = await api.delete(`/admin/usuarios/${userId}`);
        return response.data;
    }
};

export default userApi;
