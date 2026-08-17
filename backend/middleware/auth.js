import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'optibuy_secure_jwt_secret_key_2026';

/**
 * Normalize role string for consistency ('CUSTOMER', 'SALES_PERSON', 'ADMIN')
 */
export const normalizeRole = (role) => {
  if (!role) return 'CUSTOMER';
  const r = role.toUpperCase().trim();
  if (r === 'SALES' || r === 'SALESPERSON' || r === 'SALES_PERSON') return 'SALES_PERSON';
  if (r === 'ADMIN' || r === 'ADMINISTRATOR') return 'ADMIN';
  return 'CUSTOMER';
};

/**
 * Middleware to authenticate JWT token from HTTP Authorization header
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      ...decoded,
      role: normalizeRole(decoded.role)
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};

/**
 * Middleware to restrict route access to specific user roles
 * @param  {...string} allowedRoles - Allowed roles ('CUSTOMER', 'SALES_PERSON', 'ADMIN')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. User role is not defined.'
      });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowedRoles = allowedRoles.map(r => normalizeRole(r));

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: [${allowedRoles.join(', ')}]. Your role: '${req.user.role}'.`
      });
    }

    next();
  };
};
