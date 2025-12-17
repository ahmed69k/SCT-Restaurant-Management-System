// TDD Evidence: Tests written first to drive registration success and error handling

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app.routes';  // For RouterTestingModule.withRoutes

describe('RegisterComponent (US-F-01)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)  // Fixes ActivatedRoute error
      ],
      providers: [{ provide: ToastService, useValue: toastSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register successfully', fakeAsync(() => {
    component.name = 'John';
    component.email = 'john@test.com';
    component.password = '123456';
    component.role = 'User';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    expect(req.request.method).toBe('POST');
    req.flush({});

    tick();
    expect(toastSpy.success).toHaveBeenCalledWith('Registration Sucessful!');
  }));

  it('should show error when email already in use', fakeAsync(() => {
    component.name = 'Jane';
    component.email = 'taken@test.com';
    component.password = '123456';
    component.role = 'User';

    component.handleRegister();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/register');
    req.error(new ErrorEvent('Conflict'), { status: 409 });

    tick();
    expect(toastSpy.error).toHaveBeenCalledWith('Email already in use!');
    expect(component.error).toBe('Email already in use!');
  }));
});