import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { AuthService } from '../../shared/AuthService';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create spy objects for all dependencies
    mockAuthService = jasmine.createSpyObj('AuthService', ['login']);
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty email and password', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
  });

  it('should successfully login with valid credentials', () => {
    const mockResponse = { token: 'fake-token', user: { email: 'test@example.com' } };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.handleLogin();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(mockToastService.success).toHaveBeenCalledWith('Login Successful!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should handle login error with status 409', () => {
    const mockError = { status: 409, message: 'Conflict' };
    mockAuthService.login.and.returnValue(throwError(() => mockError));

    component.email = 'test@example.com';
    component.password = 'wrongpassword';
    component.handleLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
    expect(component.error).toBe('Email or password incorrect!');
  });

  it('should handle generic login error', () => {
    const mockError = { status: 500, message: 'Server Error' };
    mockAuthService.login.and.returnValue(throwError(() => mockError));

    component.email = 'test@example.com';
    component.password = 'password123';
    component.handleLogin();

    expect(mockAuthService.login).toHaveBeenCalled();
    expect(mockToastService.error).toHaveBeenCalledWith('Error logging in!');
  });

  it('should bind email input correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;
    
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should bind password input correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const passwordInput = compiled.querySelector('#password') as HTMLInputElement;
    
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(passwordInput.value).toBe('password123');
  });

  it('should display error message when error is set', () => {
    component.error = 'Test error message';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('p[style*="color: red"]');
    
    expect(errorElement?.textContent).toContain('Test error message');
  });

  it('should call handleLogin when form is submitted', () => {
    spyOn(component, 'handleLogin');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(component.handleLogin).toHaveBeenCalled();
  });

  it('should have register link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const registerLink = compiled.querySelector('a[routerLink="/register"]');
    
    expect(registerLink).toBeTruthy();
    expect(registerLink?.textContent).toContain('Sign Up');
  });
});