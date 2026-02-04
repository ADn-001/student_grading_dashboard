// middleware/auth.js
// Authentication middleware for JWT verification and role-based access control

const jwt = require('jsonwebtoken');

/**
 * Middleware: Verify JWT token and attach user info to req.user
 * Returns 401 if token is missing or invalid
 */
const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header: "Bearer <token>"
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Verify and decode token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request object for downstream routes
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Check if user has one of the required roles
 * Returns 403 if user's role is not in the allowed list
 * @param {Array<string>} allowedRoles - List of roles allowed (e.g., ['admin', 'teacher'])
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Backward compatibility exports
const auth = authenticateToken;

module.exports = { authenticateToken, auth, requireRole };