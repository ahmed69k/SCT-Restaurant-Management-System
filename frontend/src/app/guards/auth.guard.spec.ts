// TDD Evidence: Tests written to drive authenticated access and role-based redirects

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../shared/AuthService';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthGuard (US-F-04, US-F-05)', () => {
  let guard: AuthGuard;
  let authService: any;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            currentUser: null,
            loading: false
          }
        },
        { provide: Router, useValue: router }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
  });

  it('should redirect to /login if not logged in', () => {
    authService.currentUser = null;

    const result = guard.canActivate({ data: {} } as any, {} as any);

    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('should allow access if logged in and no roles required', () => {
    authService.currentUser = { role: 'User' };

    const result = guard.canActivate({ data: {} } as any, {} as any);

    expect(result).toBeTrue();
  });

  it('should allow access if role matches', () => {
    authService.currentUser = { role: 'Admin' };

    const result = guard.canActivate({ data: { roles: ['Admin'] } } as any, {} as any);

    expect(result).toBeTrue();
  });

  it('should redirect to /not-found if role does not match', () => {
    authService.currentUser = { role: 'User' };

    const result = guard.canActivate({ data: { roles: ['Admin'] } } as any, {} as any);

    expect(result).toEqual(router.createUrlTree(['/not-found']));
  });
});