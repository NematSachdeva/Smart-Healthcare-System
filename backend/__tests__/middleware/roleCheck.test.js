const roleCheck = require('../../middleware/roleCheck');

describe('Role Check Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        userId: 'user123',
        email: 'test@example.com',
        role: 'patient'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('should allow access if role matches', () => {
    const middleware = roleCheck(['patient', 'doctor']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should deny access if role does not match', () => {
    const middleware = roleCheck(['doctor', 'admin']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Insufficient permissions.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if user not authenticated', () => {
    req.user = null;
    const middleware = roleCheck(['patient']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Authentication required.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if user role is missing', () => {
    req.user = { userId: 'user123', email: 'test@example.com' };
    const middleware = roleCheck(['patient']);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Authentication required.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should allow access for admin role', () => {
    req.user.role = 'admin';
    const middleware = roleCheck(['admin']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should allow access for doctor role', () => {
    req.user.role = 'doctor';
    const middleware = roleCheck(['doctor']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should handle multiple allowed roles', () => {
    req.user.role = 'patient';
    const middleware = roleCheck(['patient', 'doctor', 'admin']);

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should handle errors gracefully', () => {
    req.user = { role: 'patient' };
    const middleware = roleCheck(null); // Invalid allowedRoles

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error checking user permissions.'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
