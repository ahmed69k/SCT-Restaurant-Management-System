import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form fields', () => {
    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.role).toBe('');
    expect(component.error).toBe('');
  });

  it('should successfully register with valid data', () => {
    const mockResponse = { message: 'Registration successful', userId: '123' };
    component.name = 'John Doe';
    component.email = 'john@example.com';
    component.password = 'password123';
    component.role = 'User';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'User'
    });
    req.flush(mockResponse);

    expect(mockToastService.success).toHaveBeenCalledWith('Registration Sucessful!');
  });

  it('should handle registration error with status 409', () => {
    component.name = 'John Doe';
    component.email = 'existing@example.com';
    component.password = 'password123';
    component.role = 'User';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    req.error(new ProgressEvent('error'), { status: 409, statusText: 'Conflict' });

    expect(mockToastService.error).toHaveBeenCalledWith('Email already in use!');
    expect(component.error).toBe('Email already in use!');
  });

  it('should handle generic registration error', () => {
    component.name = 'John Doe';
    component.email = 'john@example.com';
    component.password = 'password123';
    component.role = 'User';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });

    expect(mockToastService.error).toHaveBeenCalledWith('Error registering!');
  });

  it('should bind name input correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    
    nameInput.value = 'Test User';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(nameInput.value).toBe('Test User');
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

  it('should bind role select correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const roleSelect = compiled.querySelector('#role') as HTMLSelectElement;
    
    roleSelect.value = 'User';
    roleSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(roleSelect.value).toBe('User');
  });

  it('should display error message when error is set', () => {
    component.error = 'Test error message';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('p[style*="color: red"]');
    
    expect(errorElement?.textContent).toContain('Test error message');
  });

  it('should call handleRegister when form is submitted', () => {
    spyOn(component, 'handleRegister');
    
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(component.handleRegister).toHaveBeenCalled();
  });

  it('should have login link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loginLink = compiled.querySelector('a[routerLink="/login"]');
    
    expect(loginLink).toBeTruthy();
    expect(loginLink?.textContent).toContain('Sign In');
  });

  it('should render form title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2 = compiled.querySelector('h2');
    
    expect(h2?.textContent).toBe('Create an Account');
  });

  it('should render form subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subtitle = compiled.querySelector('.form-subtitle');
    
    expect(subtitle?.textContent).toBe('Join us! It only takes a minute.');
  });

  it('should have all required form inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('#name')).toBeTruthy();
    expect(compiled.querySelector('#email')).toBeTruthy();
    expect(compiled.querySelector('#password')).toBeTruthy();
    expect(compiled.querySelector('#role')).toBeTruthy();
  });

  it('should have all role options in select', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const options = compiled.querySelectorAll('#role option');
    
    expect(options.length).toBe(4); // Including disabled placeholder
    expect(options[0].textContent).toBe('Select a role...');
    expect(options[1].textContent).toBe('User');
    expect(options[2].textContent).toBe('Staff');
    expect(options[3].textContent).toBe('Admin');
  });

  it('should have disabled placeholder option in role select', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const placeholderOption = compiled.querySelector('#role option[value=""]') as HTMLOptionElement;
    
    expect(placeholderOption).toBeTruthy();
    expect(placeholderOption.disabled).toBe(true);
  });

  it('should mark all inputs as required', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;
    const passwordInput = compiled.querySelector('#password') as HTMLInputElement;
    const roleSelect = compiled.querySelector('#role') as HTMLSelectElement;
    
    expect(nameInput.required).toBe(true);
    expect(emailInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
    expect(roleSelect.required).toBe(true);
  });

  it('should have correct input types', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;
    const passwordInput = compiled.querySelector('#password') as HTMLInputElement;
    
    expect(nameInput.type).toBe('text');
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
  });

  it('should have correct placeholders', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const nameInput = compiled.querySelector('#name') as HTMLInputElement;
    const emailInput = compiled.querySelector('#email') as HTMLInputElement;
    const passwordInput = compiled.querySelector('#password') as HTMLInputElement;
    
    expect(nameInput.placeholder).toBe('Enter your name');
    expect(emailInput.placeholder).toBe('Enter your email');
    expect(passwordInput.placeholder).toBe('Enter your password');
  });

  it('should have labels for all form fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    const labels = compiled.querySelectorAll('label');
    expect(labels.length).toBe(4);
    
    const labelTexts = Array.from(labels).map(label => label.textContent);
    expect(labelTexts).toContain('Name');
    expect(labelTexts).toContain('Email');
    expect(labelTexts).toContain('Password');
    expect(labelTexts).toContain('Role');
  });

  it('should have submit button with correct text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    
    expect(submitButton?.textContent).toBe('Register');
    expect(submitButton?.classList.contains('btn-submit')).toBe(true);
  });

  it('should have form-container wrapper', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.form-container');
    
    expect(container).toBeTruthy();
  });

  it('should have form-card wrapper', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.form-card');
    
    expect(card).toBeTruthy();
  });

  it('should have form-footer with text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footer = compiled.querySelector('.form-footer');
    
    expect(footer?.textContent).toContain('Already have an account?');
  });

  it('should send all form data in request', () => {
    component.name = 'Jane Smith';
    component.email = 'jane@example.com';
    component.password = 'securepass';
    component.role = 'Staff';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    expect(req.request.body.name).toBe('Jane Smith');
    expect(req.request.body.email).toBe('jane@example.com');
    expect(req.request.body.password).toBe('securepass');
    expect(req.request.body.role).toBe('Staff');
    
    req.flush({ success: true });
  });

  it('should handle Admin role registration', () => {
    component.name = 'Admin User';
    component.email = 'admin@example.com';
    component.password = 'adminpass';
    component.role = 'Admin';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    expect(req.request.body.role).toBe('Admin');
    
    req.flush({ success: true });
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should not display error message initially', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const errorElement = compiled.querySelector('p[style*="color: red"]');
    
    expect(errorElement?.textContent?.trim()).toBe('');
  });
});