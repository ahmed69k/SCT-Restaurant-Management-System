// TDD Evidence: Tests written first to drive reservation creation, feedback submission, and role-based loading

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReservationsComponent } from './reservations.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/ToastService';
import { AuthService } from '../../shared/AuthService';

describe('ReservationsComponent (US-F-03, US-F-04, US-F-05)', () => {
  let component: ReservationsComponent;
  let fixture: ComponentFixture<ReservationsComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ReservationsComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ToastService, useValue: toastSpy },
        { 
          provide: AuthService, 
          useValue: { 
            currentUser: { role: 'User' }, 
            loading: false 
          } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function setupComponent() {
    fixture.detectChanges();
    tick(100); // advance interval
    const req = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    req.flush({ reservations: [] });
  }

  it('should create', fakeAsync(() => {
    setupComponent();
    expect(component).toBeTruthy();
  }));

  it('should create reservation and show success toast (US-F-03)', fakeAsync(() => {
    setupComponent();

    component.date = '2025-12-25';
    component.time = '19:00';
    component.numOfGuests = 4;

    component.submitForm();

    const postReq = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({ message: 'Reservation created successfully' });

    // Flush the second fetchMyReservations() called in success handler
    const refreshReq = httpMock.expectOne('http://localhost:3004/api/v1/reservations/my');
    refreshReq.flush({ reservations: [] });

    tick();
    expect(toastSpy.success).toHaveBeenCalledWith('Reservation created successfully');
  }));

  it('should show error when reservation fails', fakeAsync(() => {
    setupComponent();

    component.date = '2025-12-25';
    component.time = '19:00';
    component.numOfGuests = 4;

    component.submitForm();

    const postReq = httpMock.expectOne('http://localhost:3004/api/v1/reservations');
    postReq.error(new ErrorEvent('fail'), { status: 500 });

    tick();
    expect(toastSpy.error).toHaveBeenCalled();
  }));

  it('should submit feedback only if comment is filled (US-F-04)', fakeAsync(() => {
    setupComponent();

    component.selectedReservationId = '1';
    component.feedbackRating = 5;
    component.feedbackComment = 'Excellent service!';

    component.submitFeedback();

    const feedbackReq = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
    expect(feedbackReq.request.method).toBe('POST');
    feedbackReq.flush({ message: 'Feedback submitted' });

    tick();
    expect(toastSpy.success).toHaveBeenCalled();
    expect(component.showFeedbackModal).toBeFalse();
  }));

  it('should block feedback without comment', fakeAsync(() => {
    setupComponent();

    component.selectedReservationId = '1';
    component.feedbackComment = '';

    component.submitFeedback();

    expect(toastSpy.error).toHaveBeenCalledWith('Please enter a comment before submitting.');
    httpMock.expectNone('http://localhost:3001/api/v1/feedback');
  }));
});