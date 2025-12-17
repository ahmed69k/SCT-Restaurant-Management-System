const authorizationMiddleware = require('../Middleware/AuthorizationMiddleware');

const createMocks = (user = null) => {
  const req = {
    user: user,
  };

  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  };

  const next = jest.fn();

  return { req, res, next };
};

describe('Authorization Middleware (Role-Based Access Control)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call next() if the user role is in the allowed list', () => {
    const allowedRoles = ['Admin', 'Manager'];
    const { req, res, next } = createMocks({ id: 101, role: 'Admin' });

    const middleware = authorizationMiddleware(allowedRoles);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
  
  test('should call next() if the user role is in the allowed list after trimming', () => {
    const allowedRoles = ['Editor', 'Viewer'];
    const { req, res, next } = createMocks({ id: 202, role: ' Editor ' });

    const middleware = authorizationMiddleware(allowedRoles);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 403 and "Unauthorized Access!" if the user role is not allowed', () => {
    const allowedRoles = ['Manager', 'Auditor'];
    const { req, res, next } = createMocks({ id: 303, role: 'Developer' });

    const middleware = authorizationMiddleware(allowedRoles);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith("Unauthorized Access!");
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 if the role matches case-insensitively but not case-sensitively', () => {
    const allowedRoles = ['Admin'];
    const { req, res, next } = createMocks({ id: 404, role: 'admin' }); 

    const middleware = authorizationMiddleware(allowedRoles);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should throw an error if req.user is undefined (indicating missing auth middleware)', () => {
    const allowedRoles = ['Admin'];
    const { req, res, next } = createMocks(null); 

    const middleware = authorizationMiddleware(allowedRoles);
    
    expect(() => {
        middleware(req, res, next);
    }).toThrow(TypeError); 
  });
});