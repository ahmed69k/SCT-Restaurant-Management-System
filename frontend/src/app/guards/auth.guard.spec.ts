import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../shared/AuthService';
import { of, throwError } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRouteSnapshot: jasmine.SpyObj<ActivatedRouteSnapshot>;
  let mockRouterStateSnapshot: jasmine.SpyObj<RouterStateSnapshot>;

  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    role: 'User'
  };

  const mockAdminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin'
  };

  const mockStaffUser = {
    name: 'Staff User',
    email: 'staff@example.com',
    role: 'Staff'
  };

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['fetchCurrentUser'], {
      currentUser: null,
      loading: false
    });
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    
    mockActivatedRouteSnapshot = jasmine.createSpyObj<ActivatedRouteSnapshot>('ActivatedRouteSnapshot', [], {
      data: {}
    });
    
    mockRouterStateSnapshot = jasmine.createSpyObj<RouterStateSnapshot>('RouterStateSnapshot', [], {
      url: '/test'
    });
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('when user is not logged in', () => {
    beforeEach(() => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => null,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
    });

    it('should redirect to login', () => {
      const loginUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(loginUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(loginUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    });

    it('should redirect to login even with allowed roles', () => {
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin', 'Staff'] }),
        configurable: true
      });

      const loginUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(loginUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(loginUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('when user is logged in with no role restrictions', () => {
    beforeEach(() => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({}),
        configurable: true
      });
    });

    it('should allow access', () => {
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });
  });

  describe('when user is logged in with empty roles array', () => {
    beforeEach(() => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: [] }),
        configurable: true
      });
    });

    it('should allow access', () => {
      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });
  });

  describe('when user has required role', () => {
    it('should allow User role access to User-restricted route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['User'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });

    it('should allow Admin role access to Admin-restricted route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockAdminUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });

    it('should allow Staff role access to Staff-restricted route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockStaffUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Staff'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });

    it('should allow Admin access to route with multiple allowed roles', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockAdminUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin', 'Staff'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });

    it('should allow Staff access to route with multiple allowed roles', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockStaffUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin', 'Staff'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);
      expect(result).toBe(true);
    });
  });

  describe('when user does not have required role', () => {
    it('should redirect User to not-found when accessing Admin route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin'] }),
        configurable: true
      });

      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(notFoundUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    });

    it('should redirect User to not-found when accessing Staff route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Staff'] }),
        configurable: true
      });

      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(notFoundUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    });

    it('should redirect Admin to not-found when accessing User-only route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockAdminUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['User'] }),
        configurable: true
      });

      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(notFoundUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    });

    it('should redirect User to not-found when accessing Admin/Staff route', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin', 'Staff'] }),
        configurable: true
      });

      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(notFoundUrlTree);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-found']);
    });
  });

  describe('when authService is loading', () => {
    beforeEach(() => {
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => true,
        configurable: true
      });
    });

    it('should wait for user fetch and allow access if user is valid', (done) => {
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({}),
        configurable: true
      });

      mockAuthService.fetchCurrentUser.and.returnValue(of(mockUser));
      
      // After fetch, set user and loading to false
      mockAuthService.fetchCurrentUser.and.callFake(() => {
        Object.defineProperty(mockAuthService, 'currentUser', {
          get: () => mockUser,
          configurable: true
        });
        Object.defineProperty(mockAuthService, 'loading', {
          get: () => false,
          configurable: true
        });
        return of(mockUser);
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      if (result instanceof Object && 'subscribe' in result) {
        result.subscribe(value => {
          expect(value).toBe(true);
          expect(mockAuthService.fetchCurrentUser).toHaveBeenCalled();
          done();
        });
      }
    });

    it('should wait for user fetch and allow access if user has required role', (done) => {
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin'] }),
        configurable: true
      });

      mockAuthService.fetchCurrentUser.and.callFake(() => {
        Object.defineProperty(mockAuthService, 'currentUser', {
          get: () => mockAdminUser,
          configurable: true
        });
        Object.defineProperty(mockAuthService, 'loading', {
          get: () => false,
          configurable: true
        });
        return of(mockAdminUser);
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      if (result instanceof Object && 'subscribe' in result) {
        result.subscribe(value => {
          expect(value).toBe(true);
          done();
        });
      }
    });

    it('should wait for user fetch and redirect if user does not have required role', (done) => {
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin'] }),
        configurable: true
      });

      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      mockAuthService.fetchCurrentUser.and.callFake(() => {
        Object.defineProperty(mockAuthService, 'currentUser', {
          get: () => mockUser,
          configurable: true
        });
        Object.defineProperty(mockAuthService, 'loading', {
          get: () => false,
          configurable: true
        });
        return of(mockUser);
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      if (result instanceof Object && 'subscribe' in result) {
        result.subscribe(value => {
          expect(value).toBe(notFoundUrlTree);
          expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-found']);
          done();
        });
      }
    });

    it('should wait for user fetch and redirect to login if no user', (done) => {
      const loginUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(loginUrlTree);

      mockAuthService.fetchCurrentUser.and.callFake(() => {
        Object.defineProperty(mockAuthService, 'currentUser', {
          get: () => null,
          configurable: true
        });
        Object.defineProperty(mockAuthService, 'loading', {
          get: () => false,
          configurable: true
        });
        return of(null);
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      if (result instanceof Object && 'subscribe' in result) {
        result.subscribe(value => {
          expect(value).toBe(loginUrlTree);
          expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });

    it('should handle fetch error and redirect to not-found', (done) => {
      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      mockAuthService.fetchCurrentUser.and.returnValue(throwError(() => new Error('Fetch failed')));

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      if (result instanceof Object && 'subscribe' in result) {
        result.subscribe(value => {
          expect(value).toBe(notFoundUrlTree);
          expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-found']);
          done();
        });
      }
    });
  });

  describe('checkAccess private method tests through canActivate', () => {
    beforeEach(() => {
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
    });

    it('should handle case-sensitive role matching', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => ({ ...mockUser, role: 'admin' }), // lowercase
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin'] }), // uppercase
        configurable: true
      });

      const notFoundUrlTree = {} as UrlTree;
      mockRouter.createUrlTree.and.returnValue(notFoundUrlTree);

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(notFoundUrlTree);
    });

    it('should handle undefined roles data', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({}),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null route data', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => null,
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(true);
    });

    it('should work with single role in array', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockAdminUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(true);
    });

    it('should work with three roles in array', () => {
      Object.defineProperty(mockAuthService, 'currentUser', {
        get: () => mockStaffUser,
        configurable: true
      });
      Object.defineProperty(mockAuthService, 'loading', {
        get: () => false,
        configurable: true
      });
      Object.defineProperty(mockActivatedRouteSnapshot, 'data', {
        get: () => ({ roles: ['Admin', 'Staff', 'User'] }),
        configurable: true
      });

      const result = guard.canActivate(mockActivatedRouteSnapshot, mockRouterStateSnapshot);

      expect(result).toBe(true);
    });
  });
});