const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

jest.mock('jsonwebtoken');

describe('Authentication Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('should authenticate with valid token', () => {
    const mockDecoded = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'patient'
    };

    req.header.mockReturnValue('Bearer validToken');
    jwt.verify.mockReturnValue(mockDecoded);

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validToken', process.env.JWT_SECRET);
    expect(req.user).toEqual(mockDecoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 if no Authorization header', () => {
    req.header.mockReturnValue(undefined);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. No token provided.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token format is invalid', () => {
    req.header.mockReturnValue('InvalidFormat token');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Invalid token format.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is empty after Bearer', () => {
    req.header.mockReturnValue('Bearer ');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. No token provided.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 for invalid token', () => {
    req.header.mockReturnValue('Bearer invalidToken');
    jwt.verify.mockImplementation(() => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Invalid token.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 for expired token', () => {
    req.header.mockReturnValue('Bearer expiredToken');
    jwt.verify.mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Token expired.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should handle other JWT errors', () => {
    req.header.mockReturnValue('Bearer token');
    jwt.verify.mockImplementation(() => {
      throw new Error('Some other error');
    });

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Access denied. Authentication failed.'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
