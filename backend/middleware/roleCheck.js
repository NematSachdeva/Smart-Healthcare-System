/**
 * Role-Based Access Control Middleware
 * Checks if user role matches allowed roles for the route
 * Must be used after auth middleware to ensure req.user exists
 * 
 * Requirements: 14.4, 14.5
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Ensure user information exists (auth middleware should run first)
      if (!req.user || !req.user.role) {
        return res.status(401).json({ 
          message: 'Access denied. Authentication required.' 
        });
      }

      // Compare user role from token with allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.' 
        });
      }

      // Role matches, proceed to next middleware or route handler
      next();
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error checking user permissions.' 
      });
    }
  };
};

module.exports = roleCheck;
