import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FeedbacksComponent, Feedback } from './feedbacks.component';
import { ToastService } from '../../shared/ToastService';
import { AuthService } from '../../shared/AuthService';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

describe('FeedbacksComponent', () => {
  let component: FeedbacksComponent;
  let fixture: ComponentFixture<FeedbacksComponent>;
  let httpMock: HttpTestingController;
  let toastService: jasmine.SpyObj<ToastService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockFeedbacks: Feedback[] = [
    {
      _id: 'feedback1',
      userId: 'user123',
      rating: 5,
      comment: 'Great service!',
      date: '2024-12-17T10:00:00Z',
      Reservation: 'res123'
    },
    {
      _id: 'feedback2',
      userId: 'user456',
      rating: 4,
      comment: 'Good experience',
      date: '2024-12-16T15:30:00Z',
      Reservation: 'res456'
    }
  ];

  beforeEach(async () => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FeedbacksComponent, HttpClientTestingModule],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbacksComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call fetchFeedbacks on initialization', () => {
      spyOn(component, 'fetchFeedbacks');
      
      component.ngOnInit();
      
      expect(component.fetchFeedbacks).toHaveBeenCalled();
    });
  });

  describe('fetchFeedbacks', () => {
    it('should fetch feedbacks successfully', () => {
      component.fetchFeedbacks();

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);

      req.flush({ feedbacks: mockFeedbacks });

      expect(component.feedbacks).toEqual(mockFeedbacks);
      expect(component.loading).toBe(false);
    });

    it('should set loading to false after successful fetch', () => {
      component.loading = true;

      component.fetchFeedbacks();

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
      req.flush({ feedbacks: mockFeedbacks });

      expect(component.loading).toBe(false);
    });

    it('should handle empty feedbacks array', () => {
      component.fetchFeedbacks();

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
      req.flush({ feedbacks: [] });

      expect(component.feedbacks).toEqual([]);
      expect(component.loading).toBe(false);
    });

    it('should handle error when fetching feedbacks fails', () => {
      component.fetchFeedbacks();

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
      req.error(new ProgressEvent('error'));

      expect(toastService.error).toHaveBeenCalledWith('Failed to load feedbacks');
      expect(component.loading).toBe(false);
    });
  });

  describe('deleteFeedback', () => {
    beforeEach(() => {
      component.feedbacks = [...mockFeedbacks];
    });

    it('should delete feedback successfully when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteFeedback('feedback1');

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback/feedback1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.withCredentials).toBe(true);

      req.flush({ message: 'Feedback deleted successfully!' });

      expect(component.feedbacks.length).toBe(1);
      expect(component.feedbacks.find(f => f._id === 'feedback1')).toBeUndefined();
      expect(toastService.success).toHaveBeenCalledWith('Feedback deleted successfully!');
    });

    it('should not delete feedback when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteFeedback('feedback1');

      httpMock.expectNone('http://localhost:3001/api/v1/feedback/feedback1');
      expect(component.feedbacks.length).toBe(2);
    });

    it('should handle error when deleting feedback fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteFeedback('feedback1');

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback/feedback1');
      req.error(new ProgressEvent('error'));

      expect(toastService.error).toHaveBeenCalledWith('Failed to delete feedback');
      expect(component.feedbacks.length).toBe(2);
    });

    it('should remove only the specified feedback from the list', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteFeedback('feedback2');

      const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback/feedback2');
      req.flush({ message: 'Feedback deleted successfully!' });

      expect(component.feedbacks.length).toBe(1);
      expect(component.feedbacks[0]._id).toBe('feedback1');
    });
  });

  describe('Template rendering', () => {
    

    it('should render delete button for each feedback', () => {
      component.loading = false;
      component.feedbacks = mockFeedbacks;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const deleteButtons = compiled.querySelectorAll('.delete');
      
      expect(deleteButtons.length).toBe(2);
    });

    it('should call deleteFeedback when delete button is clicked', () => {
      spyOn(component, 'deleteFeedback');
      spyOn(window, 'confirm').and.returnValue(true);

      component.loading = false;
      component.feedbacks = mockFeedbacks;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const deleteButton = compiled.querySelector('.delete') as HTMLButtonElement;
      deleteButton.click();

      expect(component.deleteFeedback).toHaveBeenCalledWith('feedback1');
    });
  });
});