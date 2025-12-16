const serviceAuthMiddleware = require('../Middleware/ServiceAuthMiddleware');
const SERVICE_SECRET = 'my-test-service-secret';

process.env.SERVICE_SECRET = SERVICE_SECRET;

const createMocks = (secretHeader = undefined) => {
  const req = {
    headers: {
      'x-secret-code': secretHeader,
    },
  };

  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  };

  const next = jest.fn();

  return { req, res, next };
};

describe('Service Authentication Middleware', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call next() if a valid x-secret-code is provided', () => {
    const { req, res, next } = createMocks(SERVICE_SECRET);

    serviceAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 403 and Forbidden message if no x-secret-code header is provided', () => {
    const { req, res, next } = createMocks(undefined);

    serviceAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: Invalid Service Secret!" });
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should return 403 and Forbidden message if the x-secret-code header is an empty string', () => {
    const { req, res, next } = createMocks('');

    serviceAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: Invalid Service Secret!" });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 and Forbidden message if an incorrect secret code is provided', () => {
    const { req, res, next } = createMocks('wrong-secret-123');

    serviceAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: Invalid Service Secret!" });
    expect(next).not.toHaveBeenCalled();
  });
});