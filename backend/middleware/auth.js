const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Extracts and validates JWT token from Authorization header
 * Attaches decoded user information to request object
 * 
 * Requirements: 14.1, 14.2, 14.3
 */
const auth = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Check if token follows Bearer scheme
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token format.' 
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token using JWT secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user information to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // Proceed to next middleware or route handler
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access denied. Token expired.' 
      });
    }

    // Handle other errors
    return res.status(401).json({ 
      message: 'Access denied. Authentication failed.' 
    });
  }
};

module.exports = auth;
