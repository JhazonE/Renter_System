import axios from 'axios';
import { API_BASE_URL } from './api';

/**
 * Creates an audit log entry on the backend.
 * @param {Object} logData - The data for the audit log.
 * @param {string} logData.admin - Admin name.
 * @param {string} logData.adminId - Admin ID/Username.
 * @param {string} logData.type - Action type (e.g., 'User Creation').
 * @param {string} logData.details - Summary of the action.
 * @param {string} logData.subDetails - Detailed information about the action.
 * @param {string} logData.status - Status of the action ('Success' or 'Failure').
 */
export const createAuditLog = async (logData) => {
  try {
    const now = new Date();
    // Format date as YYYY-MM-DD
    const date = now.toISOString().split('T')[0];
    // Format time as HH:MM
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // Generate initials
    const initials = logData.admin 
      ? logData.admin.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) 
      : '??';

    await axios.post(`${API_BASE_URL}/audit-logs`, {
      ...logData,
      date,
      time,
      initials
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
