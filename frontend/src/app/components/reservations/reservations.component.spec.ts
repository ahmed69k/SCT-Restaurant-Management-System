import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReservationsComponent, Reservation } from './reservations.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { AuthService, User } from '../../shared/AuthService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('ReservationsComponent', () => {
  let component: ReservationsComponent;
  let fixture: ComponentFixture<ReservationsComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUserUser: User = {
    name: 'Regular User',
    email: 'user@example.com',
    role: 'User'
  };

  const mockAdminUser: User = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin'
  };

  const mockStaffUser: User = {
    name: 'Staff User',
    email: 'staff@example.com',
    role: 'Staff'
  };

  const mockReservations: Reservation[] = [
    {
      _id: '1',
      date: '2025-12-25',
      time: '19:00',
      numberOfGuests: 4,
      status: 'Pending',
      customer: mockUserUser
    },
    {
      _id: '2',
      date: '2025-12-26',
      time: '20:00',
      numberOfGuests: 2,
      status: 'Being Prepared',
      customer: mockUserUser
    }
  ];

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUserUser,
      loading: false
    });

    await TestBed.configureTestingModule({
      imports: [ReservationsComponent, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form fields', () => {
    expect(component.date).toBe('');
    expect(component.time).toBe('');
    expect(component.numOfGuests).toBe(0);
  });

  it('should initialize with empty reservations arrays', () => {
    expect(component.reservations).toEqual([]);
    expect(component.myReservations).toEqual([]);
  });

  it('should initialize with loading true', () => {
    expect(component.loading).toBe(true);
  });

  it('should set today date on init', fakeAsync(() => {
    const expectedDate = new Date().toISOString().split('T')[0];
    fixture.detectChanges();
    tick(100);
    expect(component.today).toBe(expectedDate);
  }));

  it('should get user from authService', () => {
    expect(component.user).toEqual(mockUserUser);
  });

  it('should identify admin users correctly', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockAdminUser
    });
    expect(component.isAdmin).toBe(true);
    expect(component.isStaff).toBe(false);
    expect(component.isUser).toBe(false);
  });

  it('should identify staff users correctly', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockStaffUser
    });
    expect(component.isAdmin).toBe(false);
    expect(component.isStaff).toBe(true);
    expect(component.isUser).toBe(false);
  });

  it('should identify regular users correctly', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    expect(component.isAdmin).toBe(false);
    expect(component.isStaff).toBe(false);
    expect(component.isUser).toBe(true);
  });

  it('should fetch my reservations for regular user on init', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => false
    });

    fixture.detectChanges();
    tick(100);

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Success', reservations: mockReservations });

    expect(component.myReservations).toEqual(mockReservations);
  }));

  it('should fetch all reservations for admin on init', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockAdminUser
    });
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => false
    });

    fixture.detectChanges();
    tick(100);

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Success', reservations: mockReservations });

    expect(component.reservations).toEqual(mockReservations);
  }));

  it('should fetch all reservations for staff on init', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockStaffUser
    });
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => false
    });

    fixture.detectChanges();
    tick(100);

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Success', reservations: mockReservations });

    expect(component.reservations).toEqual(mockReservations);
  }));

  it('should submit reservation form successfully', fakeAsync(() => {
    component.date = '2025-12-25';
    component.time = '19:00';
    component.numOfGuests = 4;

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.numberOfGuests).toBe(4);
    expect(req.request.body.time).toBe('19:00');
    
    req.flush({ message: 'Reservation created successfully' });
    tick();

    const myReservationsReq = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    myReservationsReq.flush({ message: 'Success', reservations: [] });

    expect(mockToastService.success).toHaveBeenCalledWith('Reservation created successfully');
  }));

  it('should handle reservation submission error', () => {
    component.date = '2025-12-25';
    component.time = '19:00';
    component.numOfGuests = 4;

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    req.error(new ProgressEvent('error'), { 
      status: 400, 
      statusText: 'Bad Request'
    });

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to create reservation');
  });

  it('should fetch reservations successfully', () => {
    component.fetchReservations();

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Success', reservations: mockReservations });

    expect(component.reservations).toEqual(mockReservations);
  });

  it('should handle fetch reservations error', () => {
    component.fetchReservations();

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    req.error(new ProgressEvent('error'));

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load reservations');
  });

  it('should fetch my reservations successfully', () => {
    component.fetchMyReservations();

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    expect(req.request.method).toBe('GET');
    req.flush({ message: 'Success', reservations: mockReservations });

    expect(component.myReservations).toEqual(mockReservations);
  });

  it('should handle fetch my reservations error', () => {
    component.fetchMyReservations();

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    req.error(new ProgressEvent('error'), { status: 500 });

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load your reservations');
  });

  it('should approve reservation successfully', () => {
    component.reservations = [...mockReservations];
    
    component.approveReservation('1');

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status: 'Being Prepared' });
    
    const updatedReservation = { ...mockReservations[0], status: 'Being Prepared' as const };
    req.flush({ message: 'Reservation approved', reservation: updatedReservation });

    expect(component.reservations[0].status).toBe('Being Prepared');
    expect(mockToastService.success).toHaveBeenCalledWith('Reservation approved');
  });

  it('should cancel reservation successfully', () => {
    component.reservations = [...mockReservations];
    
    component.cancelReservation('1');

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Reservation cancelled', reservation: mockReservations[0] });

    expect(component.reservations.length).toBe(1);
    expect(component.reservations.find(r => r._id === '1')).toBeUndefined();
    expect(mockToastService.success).toHaveBeenCalledWith('Reservation cancelled');
  });

  it('should open feedback modal', () => {
    component.giveFeedback('1');

    expect(component.showFeedbackModal).toBe(true);
    expect(component.selectedReservationId).toBe('1');
    expect(component.feedbackRating).toBe(5);
    expect(component.feedbackComment).toBe('');
  });

  it('should close feedback modal', () => {
    component.showFeedbackModal = true;
    component.selectedReservationId = '1';
    
    component.closeFeedbackModal();

    expect(component.showFeedbackModal).toBe(false);
    expect(component.selectedReservationId).toBeNull();
  });

  it('should submit feedback successfully', () => {
    component.selectedReservationId = '1';
    component.feedbackRating = 5;
    component.feedbackComment = 'Great experience!';

    component.submitFeedback();

    const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      rating: 5,
      comment: 'Great experience!',
      reservationId: '1'
    });
    req.flush({ message: 'Feedback submitted successfully' });

    expect(mockToastService.success).toHaveBeenCalledWith('Feedback submitted successfully');
    expect(component.showFeedbackModal).toBe(false);
  });

  it('should not submit feedback without comment', () => {
    component.selectedReservationId = '1';
    component.feedbackRating = 5;
    component.feedbackComment = '';

    component.submitFeedback();

    httpMock.expectNone('http://localhost:3001/api/v1/feedback');
    expect(mockToastService.error).toHaveBeenCalledWith('Please enter a comment before submitting.');
  });

  it('should not submit feedback with whitespace-only comment', () => {
    component.selectedReservationId = '1';
    component.feedbackRating = 5;
    component.feedbackComment = '   ';

    component.submitFeedback();

    httpMock.expectNone('http://localhost:3001/api/v1/feedback');
    expect(mockToastService.error).toHaveBeenCalledWith('Please enter a comment before submitting.');
  });

  it('should not submit feedback without selected reservation', () => {
    component.selectedReservationId = null;
    component.feedbackRating = 5;
    component.feedbackComment = 'Great!';

    component.submitFeedback();

    httpMock.expectNone('http://localhost:3001/api/v1/feedback');
  });

  it('should handle feedback submission error', () => {
    component.selectedReservationId = '1';
    component.feedbackRating = 5;
    component.feedbackComment = 'Great experience!';

    component.submitFeedback();

    const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
    req.error(new ProgressEvent('error'), { status: 500 });

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to submit feedback');
  });

  it('should correctly identify past reservations', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    expect(component.isPastReservation(pastDate.toISOString(), '12:00')).toBe(true);
  });

  it('should correctly identify future reservations', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    expect(component.isPastReservation(futureDate.toISOString(), '12:00')).toBe(false);
  });

  it('should handle isPastReservation without time', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    expect(component.isPastReservation(pastDate.toISOString())).toBe(true);
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('Pending')).toBe('pending');
    expect(component.getStatusClass('Being Prepared')).toBe('being-prepared');
    expect(component.getStatusClass('Ready')).toBe('ready');
  });

  it('should render user hero section for regular users', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => false
    });
    
    component.loading = false;
    fixture.detectChanges();
    tick(100);

    httpMock.expectOne('http://localhost:3004/api/v1/reservations/my').flush({
      message: 'Success',
      reservations: []
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const heroSection = compiled.querySelector('.user-hero');
    expect(heroSection).toBeTruthy();
  }));

  it('should render reservation form for regular users', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('.reservation-form');
    expect(form).toBeTruthy();
  }));

  it('should render admin table for admin users', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockAdminUser
    });
    
    component.loading = false;
    component.reservations = mockReservations;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('.admin-table');
    expect(table).toBeTruthy();
  }));

  it('should show feedback modal when showFeedbackModal is true', () => {
    component.showFeedbackModal = true;
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('.modal-backdrop');
    expect(modal).toBeTruthy();
  });

  it('should hide feedback modal when showFeedbackModal is false', () => {
    component.showFeedbackModal = false;
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('.modal-backdrop');
    expect(modal).toBeFalsy();
  });

  it('should display "no reservations" message when myReservations is empty', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    
    component.loading = false;
    component.myReservations = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const message = Array.from(compiled.querySelectorAll('p')).find(
      p => p.textContent?.includes('You have no reservations yet')
    );
    expect(message).toBeTruthy();
  }));

  it('should display reservations table when myReservations has items', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    
    component.loading = false;
    component.myReservations = mockReservations;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('.my-reservations .admin-table');
    expect(table).toBeTruthy();
  }));

  it('should have date input with min attribute set to today', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });
    
    component.loading = false;
    component.today = '2025-12-17';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dateInput = compiled.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput?.min).toBe('2025-12-17');
  }));

  it('should initialize feedback modal fields correctly', () => {
    expect(component.showFeedbackModal).toBe(false);
    expect(component.selectedReservationId).toBeNull();
    expect(component.feedbackRating).toBe(5);
    expect(component.feedbackComment).toBe('');
  });

  it('should wait for authService to finish loading before fetching data', fakeAsync(() => {
    Object.defineProperty(mockAuthService, 'loading', {
      get: jasmine.createSpy('loading').and.returnValues(true, true, false)
    });
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockUserUser
    });

    fixture.detectChanges();
    tick(100);

    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    req.flush({ message: 'Success', reservations: [] });

    expect(component.loading).toBe(false);
  }));
});