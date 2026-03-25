const { getPermissionsByRole } = require('../../infrastructure/security/permissions');

class User {
  constructor({
    id,
    name,
    email,
    username,
    role,
    password,
    status = 'Active',
    lastLogin,
    initials,
    createdAt,
    customPermissions = []
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.username = username;
    this.role = role;
    this.password = password;
    this.status = status;
    this.lastLogin = lastLogin;
    this.initials = initials;
    this.createdAt = createdAt;
    this.customPermissions = customPermissions;
    
    // Merge role-based permissions with custom overrides
    const rolePermissions = getPermissionsByRole(role);
    this.permissions = Array.from(new Set([...rolePermissions, ...customPermissions]));
  }
}

module.exports = User;
