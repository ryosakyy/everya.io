/**
 * Application constants
 */

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://everyaio-production.up.railway.app';

// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/',
    DASHBOARD: '/dashboard'
};

// Tab identifiers
export const TABS = {
    // Employee tabs
    MARCAR: 'marcar',
    CALENDARIO: 'calendario',
    NOMINA: 'nomina',
    // Admin tabs
    REPORTES: 'reportes',
    CALENDARIOS: 'calendarios',
    EMPLEADOS: 'empleados'
};

// Shift types
export const SHIFTS = {
    MANANA: 'manana',
    TARDE: 'tarde'
};

// Shift display text
export const SHIFT_LABELS = {
    manana: 'Turno Mañana (9:00 AM - 3:00 PM)',
    tarde: 'Turno Tarde (3:00 PM - 9:00 PM)',
    default: 'Turno Mañana / Tarde'
};
