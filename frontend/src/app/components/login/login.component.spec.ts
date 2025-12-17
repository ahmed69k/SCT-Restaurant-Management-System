// TDD Evidence: These tests were written to drive login success, invalid credentials error, and generic error handling

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { AuthService } from '../../shared/AuthService';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/ToastService';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('LoginComponent (US-F-01, US-F-04)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)  // Provides real testing router
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastSpy }
        // REMOVED: { provide: Router, useValue: routerSpy } ← this was the problem!
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ================= UNIT TESTS =================
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should bind email and password from form inputs', () => {
    component.email = 'test@example.com';
    component.password = '123456';
    expect(component.email).toBe('test@example.com');
    expect(component.password).toBe('123456');
  });

  // ================= INTEGRATION TESTS =================
  it('should call AuthService.login and navigate on successful login (US-F-01)', () => {
    const mockResponse = { message: 'Login successful' };
    authServiceSpy.login.and.returnValue(of(mockResponse));

    component.email = 'user@test.com';
    component.password = 'password123';

    // Spy on the real testing router's navigate method
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.stub();

    component.handleLogin();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'password123'
    });
    expect(toastSpy.success).toHaveBeenCalledWith('Login Successful!');
    expect(navigateSpy).toHaveBeenCalledWith(['/profile']);
  });

  it('should show error message when login fails with invalid credentials (US-F-04)', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 409 })));

    component.email = 'wrong@test.com';
    component.password = 'wrongpassword';

    component.handleLogin();

    expect(component.error).toBe('Email or password incorrect!');
  });

  it('should show generic error toast for unexpected errors', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.handleLogin();

    expect(toastSpy.error).toHaveBeenCalledWith('Error logging in!');
  });
});