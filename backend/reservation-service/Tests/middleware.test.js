const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Set up test environment
process.env.SECRET_KEY = 'test-secret-key-for-testing-only';
process.env.SERVICE_SECRET = 'test-service-secret-123';

// Import middleware - adjust the folder name if needed (feedback-service, user-service, etc.)
const authenticationMiddleware = require('../Middleware/AuthenticationMiddleware');
const authorizationMiddleware = require('../Middleware/AuthorizationMiddleware');
const serviceAuthMiddleware = require('../Middleware/ServiceAuthMiddleware');

describe('Middleware Integration Tests', () => {
  let app;
  const secretKey = process.env.SECRET_KEY;
  const serviceSecret = process.env.SERVICE_SECRET;

  // Helper function to create a valid JWT token
  const createToken = (userData) => {
    return jwt.sign({ user: userData }, secretKey, { expiresIn: '1h' });
  };

  // Create a fresh app instance for each test
  beforeEach(() => {
    app = express();
    app.use(cookieParser());
    app.use(express.json());
  });

  describe('Authentication Middleware Tests', () => {
    beforeEach(() => {
      // Protected route that uses authentication middleware
      app.get('/protected', authenticationMiddleware, (req, res) => {
        res.status(200).json({ 
          message: 'Access granted', 
          user: req.user 
        });
      });
    });

    it('should return 405 when no cookies are provided', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(405);

      expect(response.body.message).toBe('No token provided');
    });

    it('should return 405 when token is missing in cookie', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Cookie', ['otherCookie=value'])
        .expect(405);

      expect(response.body.message).toBe('No token provided');
    });

    it('should return 403 when token is invalid', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Cookie', ['token=invalid-token'])
        .expect(403);

      expect(response.body.message).toBe('Invalid token');
    });

    it('should return 403 when token is expired', async () => {
      const expiredToken = jwt.sign(
        { user: { id: 1, email: 'test@example.com', role: 'User' } },
        secretKey,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/protected')
        .set('Cookie', [`token=${expiredToken}`])
        .expect(403);

      expect(response.body.message).toBe('Invalid token');
    });

    it('should return 403 when token signature is invalid', async () => {
      const invalidToken = jwt.sign(
        { user: { id: 1, email: 'test@example.com', role: 'User' } },
        'wrong-secret-key'
      );

      const response = await request(app)
        .get('/protected')
        .set('Cookie', [`token=${invalidToken}`])
        .expect(403);

      expect(response.body.message).toBe('Invalid token');
    });

    it('should allow access with valid token', async () => {
      const userData = { 
        id: 1, 
        email: 'test@example.com', 
        role: 'User',
        name: 'Test User'
      };
      const validToken = createToken(userData);

      const response = await request(app)
        .get('/protected')
        .set('Cookie', [`token=${validToken}`])
        .expect(200);

      expect(response.body.message).toBe('Access granted');
      expect(response.body.user).toMatchObject(userData);
    });

    it('should attach user data to request object', async () => {
      const userData = { 
        id: 2, 
        email: 'admin@example.com', 
        role: 'Admin',
        name: 'Admin User'
      };
      const validToken = createToken(userData);

      const response = await request(app)
        .get('/protected')
        .set('Cookie', [`token=${validToken}`])
        .expect(200);

      expect(response.body.user.id).toBe(2);
      expect(response.body.user.email).toBe('admin@example.com');
      expect(response.body.user.role).toBe('Admin');
    });

    it('should work with multiple cookies', async () => {
      const userData = { id: 1, email: 'test@example.com', role: 'User' };
      const validToken = createToken(userData);

      const response = await request(app)
        .get('/protected')
        .set('Cookie', [
          `token=${validToken}`,
          'sessionId=abc123',
          'preferences=dark-mode'
        ])
        .expect(200);

      expect(response.body.message).toBe('Access granted');
    });

    it('should handle malformed JWT token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Cookie', ['token=not.a.valid.jwt'])
        .expect(403);

      expect(response.body.message).toBe('Invalid token');
    });

    it('should handle token with wrong structure', async () => {
      const wrongToken = jwt.sign({ wrongKey: 'value' }, secretKey);

      const response = await request(app)
        .get('/protected')
        .set('Cookie', [`token=${wrongToken}`])
        .expect(200);

      // The middleware doesn't validate the user structure, so it passes through
      expect(response.body.message).toBe('Access granted');
    });
  });

  describe('Authorization Middleware Tests', () => {
    beforeEach(() => {
      // Routes with different role requirements
      app.get(
        '/admin-only',
        authenticationMiddleware,
        authorizationMiddleware(['Admin']),
        (req, res) => {
          res.status(200).json({ message: 'Admin access granted' });
        }
      );

      app.get(
        '/staff-only',
        authenticationMiddleware,
        authorizationMiddleware(['Staff']),
        (req, res) => {
          res.status(200).json({ message: 'Staff access granted' });
        }
      );

      app.get(
        '/admin-or-staff',
        authenticationMiddleware,
        authorizationMiddleware(['Admin', 'Staff']),
        (req, res) => {
          res.status(200).json({ message: 'Admin or Staff access granted' });
        }
      );

      app.get(
        '/all-roles',
        authenticationMiddleware,
        authorizationMiddleware(['Admin', 'Staff', 'User']),
        (req, res) => {
          res.status(200).json({ message: 'All roles access granted' });
        }
      );
    });

    describe('Admin-only route', () => {
      it('should allow Admin access', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-only')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Admin access granted');
      });

      it('should deny User access', async () => {
        const userData = { id: 2, email: 'user@example.com', role: 'User' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-only')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });

      it('should deny Staff access', async () => {
        const userData = { id: 3, email: 'staff@example.com', role: 'Staff' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-only')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });
    });

    describe('Staff-only route', () => {
      it('should allow Staff access', async () => {
        const userData = { id: 3, email: 'staff@example.com', role: 'Staff' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/staff-only')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Staff access granted');
      });

      it('should deny Admin access', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/staff-only')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });

      it('should deny User access', async () => {
        const userData = { id: 2, email: 'user@example.com', role: 'User' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/staff-only')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });
    });

    describe('Admin or Staff route', () => {
      it('should allow Admin access', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-or-staff')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Admin or Staff access granted');
      });

      it('should allow Staff access', async () => {
        const userData = { id: 3, email: 'staff@example.com', role: 'Staff' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-or-staff')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Admin or Staff access granted');
      });

      it('should deny User access', async () => {
        const userData = { id: 2, email: 'user@example.com', role: 'User' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-or-staff')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });
    });

    describe('All roles route', () => {
      it('should allow Admin access', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/all-roles')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('All roles access granted');
      });

      it('should allow Staff access', async () => {
        const userData = { id: 3, email: 'staff@example.com', role: 'Staff' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/all-roles')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('All roles access granted');
      });

      it('should allow User access', async () => {
        const userData = { id: 2, email: 'user@example.com', role: 'User' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/all-roles')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('All roles access granted');
      });
    });

    describe('Role trimming', () => {
      it('should handle roles with leading whitespace', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: '  Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-only')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Admin access granted');
      });

      it('should handle roles with trailing whitespace', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin  ' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-only')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Admin access granted');
      });

      it('should handle roles with both leading and trailing whitespace', async () => {
        const userData = { id: 3, email: 'staff@example.com', role: '  Staff  ' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/staff-only')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Staff access granted');
      });

      it('should handle empty role string after trim', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: '   ' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/admin-only')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });
    });

    it('should be case-sensitive for role matching', async () => {
      const userData = { id: 1, email: 'admin@example.com', role: 'admin' };
      const token = createToken(userData);

      const response = await request(app)
        .get('/admin-only')
        .set('Cookie', [`token=${token}`])
        .expect(403);

      expect(response.body).toBe('Unauthorized Access!');
    });
  });

  describe('Service Authentication Middleware Tests', () => {
    beforeEach(() => {
      // Service-to-service protected route
      app.get('/internal-api', serviceAuthMiddleware, (req, res) => {
        res.status(200).json({ message: 'Service access granted' });
      });

      app.post('/internal-api', serviceAuthMiddleware, (req, res) => {
        res.status(200).json({ message: 'Service post successful', data: req.body });
      });
    });

    it('should return 403 when no header is provided', async () => {
      const response = await request(app)
        .get('/internal-api')
        .expect(403);

      expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
    });

    it('should return 403 when x-secret-code header is missing', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('Authorization', 'Bearer token')
        .expect(403);

      expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
    });

    it('should return 403 when x-secret-code is incorrect', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('x-secret-code', 'wrong-secret')
        .expect(403);

      expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
    });

    it('should return 403 when x-secret-code is empty string', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('x-secret-code', '')
        .expect(403);

      expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
    });

    it('should allow access with correct x-secret-code header', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('x-secret-code', serviceSecret)
        .expect(200);

      expect(response.body.message).toBe('Service access granted');
    });

    it('should allow POST requests with correct secret', async () => {
      const testData = { key: 'value', number: 123 };

      const response = await request(app)
        .post('/internal-api')
        .set('x-secret-code', serviceSecret)
        .send(testData)
        .expect(200);

      expect(response.body.message).toBe('Service post successful');
      expect(response.body.data).toEqual(testData);
    });

    it('should NOT be case-sensitive for header name (HTTP headers are case-insensitive)', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('X-SECRET-CODE', serviceSecret) // uppercase
        .expect(200);

      // HTTP headers are case-insensitive by spec, so this should work
      expect(response.body.message).toBe('Service access granted');
    });

    it('should work with other headers present', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('x-secret-code', serviceSecret)
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'TestAgent')
        .expect(200);

      expect(response.body.message).toBe('Service access granted');
    });

    it('should reject partial matches of secret', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('x-secret-code', serviceSecret.substring(0, 10))
        .expect(403);

      expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
    });

    it('should reject secret with extra characters', async () => {
      const response = await request(app)
        .get('/internal-api')
        .set('x-secret-code', serviceSecret + 'extra')
        .expect(403);

      expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
    });
  });

  describe('Combined Middleware Tests', () => {
    beforeEach(() => {
      // Route combining authentication and authorization
      app.get(
        '/combined-auth',
        authenticationMiddleware,
        authorizationMiddleware(['Admin']),
        (req, res) => {
          res.status(200).json({ 
            message: 'Combined check passed',
            user: req.user
          });
        }
      );

      // Route combining service auth and user auth
      app.get(
        '/service-and-user',
        serviceAuthMiddleware,
        authenticationMiddleware,
        (req, res) => {
          res.status(200).json({ 
            message: 'Service and user auth passed',
            user: req.user
          });
        }
      );
    });

    describe('Authentication + Authorization', () => {
      it('should fail authentication before authorization check', async () => {
        const response = await request(app)
          .get('/combined-auth')
          .expect(405);

        expect(response.body.message).toBe('No token provided');
      });

      it('should pass authentication but fail authorization', async () => {
        const userData = { id: 2, email: 'user@example.com', role: 'User' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/combined-auth')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body).toBe('Unauthorized Access!');
      });

      it('should pass both authentication and authorization', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/combined-auth')
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Combined check passed');
        expect(response.body.user.role).toBe('Admin');
      });
    });

    describe('Service Auth + User Auth', () => {
      it('should fail service auth before user auth', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/service-and-user')
          .set('Cookie', [`token=${token}`])
          .expect(403);

        expect(response.body.message).toBe('Forbidden: Invalid Service Secret!');
      });

      it('should fail user auth after passing service auth', async () => {
        const response = await request(app)
          .get('/service-and-user')
          .set('x-secret-code', serviceSecret)
          .expect(405);

        expect(response.body.message).toBe('No token provided');
      });

      it('should pass both service auth and user auth', async () => {
        const userData = { id: 1, email: 'admin@example.com', role: 'Admin' };
        const token = createToken(userData);

        const response = await request(app)
          .get('/service-and-user')
          .set('x-secret-code', serviceSecret)
          .set('Cookie', [`token=${token}`])
          .expect(200);

        expect(response.body.message).toBe('Service and user auth passed');
        expect(response.body.user).toMatchObject(userData);
      });
    });
  });
});