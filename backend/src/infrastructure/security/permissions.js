const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMINISTRATOR: 'Administrator',
  MANAGER: 'Manager',
  STAFF: 'Staff'
};

const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_REGISTRATIONS: 'manage_registrations',
  VIEW_LOGS: 'view_logs',
  MANAGE_DEVICES: 'manage_devices',
  SYSTEM_CONFIG: 'system_config',
  VIEW_ANALYTICS: 'view_analytics',
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_REGISTRATIONS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_DEVICES,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.ADMINISTRATOR]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_REGISTRATIONS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_DEVICES,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.MANAGE_REGISTRATIONS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.MANAGE_REGISTRATIONS,
  ],
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsByRole: (role) => ROLE_PERMISSIONS[role] || [],
  hasPermission: (role, permission) => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }
};
