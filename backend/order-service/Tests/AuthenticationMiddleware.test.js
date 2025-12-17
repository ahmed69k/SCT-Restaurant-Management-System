process.env.SECRET_KEY = 'test-secret';

const authenticationMiddleware = require('../Middleware/AuthenticationMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const createMocks = (cookies = null) => {
  const req = {
    cookies: cookies,
    user: undefined,
  };

  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  };

  const next = jest.fn();

  return { req, res, next };
};

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call next() and attach user info for a valid token', () => {
    const mockDecodedUser = { user: 'testUser123', iat: 1234567890 };
    
    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      callback(null, mockDecodedUser);
    });

    const { req, res, next } = createMocks({ token: 'valid-jwt-token' });

    authenticationMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-jwt-token', 'test-secret', expect.any(Function));
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toBe('testUser123');
  });

  test('should return 401 and "No Cookie provided" if no cookies are present', () => {
    const { req, res, next } = createMocks(null);

    authenticationMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No Cookie provided" });
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test('should return 405 and "No token provided" if cookie is present but no token key', () => {
    const { req, res, next } = createMocks({ session: 'sessionId' });

    authenticationMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test('should return 403 and "Invalid token" if jwt.verify returns an error', () => {
    jwt.verify.mockImplementationOnce((token, secret, callback) => {
      callback(new Error('JWT expired'));
    });

    const { req, res, next } = createMocks({ token: 'expired-jwt-token' });

    authenticationMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});