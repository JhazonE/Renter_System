const jwt = require('jsonwebtoken');
const { hasPermission } = require('../security/permissions');

const authorize = (requiredPermission) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // For development/backward compatibility, check X-User-Role if no Authorization header
    if (!authHeader) {
      const userRole = req.headers['x-user-role'];
      if (userRole && hasPermission(userRole, requiredPermission)) {
        return next();
      }
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;

      if (hasPermission(decoded.role, requiredPermission)) {
        return next();
      }

      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};

module.exports = authorize;
