// TDD Evidence: Tests written first to drive feedback loading and deletion

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FeedbacksComponent } from './feedbacks.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';

describe('FeedbacksComponent (US-F-05)', () => {
  let component: FeedbacksComponent;
  let fixture: ComponentFixture<FeedbacksComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [FeedbacksComponent, HttpClientTestingModule],
      providers: [{ provide: ToastService, useValue: toastSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbacksComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
    req.flush({ feedbacks: [] });
    expect(component).toBeTruthy();
  });

  it('should load feedbacks on init', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback');
    req.flush({ feedbacks: [{
      _id: '1',
      userId: 'user123',
      rating: 5,
      comment: 'Good',
      date: '2025-12-17',
      Reservation: 'res123'
    }] });

    tick();
    expect(component.feedbacks.length).toBe(1);
  }));

  it('should delete feedback when confirmed', fakeAsync(() => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3001/api/v1/feedback').flush({ feedbacks: [] });

    component.feedbacks = [{
      _id: '1',
      userId: 'user123',
      rating: 5,
      comment: 'Good',
      date: '2025-12-17',
      Reservation: 'res123'
    }];

    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteFeedback('1');

    const req = httpMock.expectOne('http://localhost:3001/api/v1/feedback/1');
    req.flush({ message: 'Deleted' });

    tick();
    expect(component.feedbacks.length).toBe(0);
    expect(toastSpy.success).toHaveBeenCalled();
  }));
});