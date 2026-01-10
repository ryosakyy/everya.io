/**
 * Attendance API endpoints
 */
import api, { API_URL } from './index';

export const attendanceApi = {
    /**
     * Mark attendance (entry or exit)
     * @param {number} userId - User ID
     * @param {string} photoBase64 - Photo in base64 format
     * @returns {Promise} API response
     */
    mark: async (userId, photoBase64) => {
        const response = await api.post('/marcar_asistencia', {
            id_usuario: userId,
            foto: photoBase64
        });
        return response.data;
    },

    /**
     * Get all attendance reports (admin)
     * @returns {Promise} List of attendance records
     */
    getAllReports: async () => {
        const response = await api.get('/reportes');
        return response.data;
    },

    /**
     * Get attendance history for a user
     * @param {number} userId - User ID
     * @returns {Promise} List of attendance records
     */
    getByUser: async (userId) => {
        const response = await api.get(`/asistencias/usuario/${userId}`);
        return response.data;
    },

    /**
     * Get photo URL
     * @param {string} filename - Photo filename
     * @returns {string} Full URL to photo
     */
    getPhotoUrl: (filename) => {
        return `${API_URL}/fotos_asistencia/${filename}`;
    }
};

export default attendanceApi;
