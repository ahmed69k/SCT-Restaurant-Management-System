// TDD Evidence: Tests written to drive navbar visibility, login state, and logout

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../shared/AuthService';
import { ToastService } from '../../shared/ToastService';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { of } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['logout', 'isLoggedIn']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success']);

    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show user when logged in', () => {
    authSpy.isLoggedIn.and.returnValue(true);  // ← FIX: make it return true
    (authSpy as any).currentUser = { 
      name: 'John', 
      email: 'john@test.com', 
      role: 'User' 
    };

    fixture.detectChanges();

    expect(component.user).toEqual({ 
      name: 'John', 
      email: 'john@test.com', 
      role: 'User' 
    });
    expect(component.isLoggedIn()).toBeTrue();
  });

  it('should call logout and show toast', () => {
    authSpy.logout.and.returnValue(of({}));

    component.logout();

    expect(authSpy.logout).toHaveBeenCalled();
    expect(toastSpy.success).toHaveBeenCalledWith('Logged Out!');
  });

  it('should return false when not logged in', () => {
    authSpy.isLoggedIn.and.returnValue(false);  // ← FIX: make it return false
    (authSpy as any).currentUser = null;

    expect(component.isLoggedIn()).toBeFalse();
  });
});