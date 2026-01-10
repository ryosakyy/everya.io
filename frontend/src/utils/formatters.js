/**
 * Utility functions for formatting
 */

/**
 * Format date string to locale format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

/**
 * Format time string
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {string} Formatted time
 */
export function formatTime(timeStr) {
    if (!timeStr) return '-';
    // Remove seconds if present
    return timeStr.substring(0, 5);
}

/**
 * Format minutes to hours and minutes
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted string
 */
export function formatMinutesToTime(minutes) {
    if (!minutes || minutes <= 0) return '0 min';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
}

/**
 * Get shift display text
 * @param {string} turno - Shift type (manana/tarde)
 * @param {boolean} isAdmin - Is user admin
 * @returns {string} Display text
 */
export function getShiftLabel(turno, isAdmin = false) {
    if (isAdmin) return 'Administrador';

    switch (turno) {
        case 'manana':
            return 'Turno Mañana (9:00 AM - 3:00 PM)';
        case 'tarde':
            return 'Turno Tarde (3:00 PM - 9:00 PM)';
        default:
            return 'Turno Mañana / Tarde';
    }
}
