import { verifyJWT } from '../utils/security.js';
import { db } from '../data/db.js';
import { getPermissionsForRole } from '../utils/roles.js';

/**
 * Express-compatible middleware for JWT authentication
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = verifyJWT(token);
    const user = db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account no longer exists.'
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: getPermissionsForRole(user.role)
    };

    if (next) next();
    return req.user;
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: `Authentication failed: ${err.message}`
    });
  }
}

/**
 * Express-compatible middleware for Role-Based Access Control
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    if (next) next();
  };
}

/**
 * Native HTTP helper to authenticate request
 */
export function extractAndVerifyUser(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new Error('Access denied. Authentication token required.');
  }

  const decoded = verifyJWT(token);
  const user = db.findUserById(decoded.id);

  if (!user) {
    throw new Error('Invalid session. User no longer exists.');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: getPermissionsForRole(user.role)
  };
}

