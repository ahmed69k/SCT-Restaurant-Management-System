// TDD Evidence: Tests written first to drive user listing, deletion, and update for admin

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';

describe('UsersComponent (US-F-08)', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [UsersComponent, FormsModule, HttpClientTestingModule],
      providers: [{ provide: ToastService, useValue: toastSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushInitialFetch() {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    req.flush({ users: [] });
  }

  it('should create', fakeAsync(() => {
    flushInitialFetch();
    expect(component).toBeTruthy();
  }));

  it('should load users on init', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    req.flush({ 
      users: [{ 
        _id: '1', 
        name: 'John', 
        email: 'john@test.com', 
        role: 'User',
        timestamp: '2025-12-17T00:00:00Z'
      }] 
    });

    tick();
    expect(component.users.length).toBe(1);
  }));

  it('should delete user', fakeAsync(() => {
    flushInitialFetch();

    component.users = [{ 
      _id: '1', 
      name: 'John', 
      email: 'john@test.com', 
      role: 'User',
      timestamp: '2025-12-17T00:00:00Z'
    }];

    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteUser('1');

    const deleteReq = httpMock.expectOne('http://localhost:3000/api/v1/users/1');
    deleteReq.flush({ message: 'User deleted' });

    tick();
    expect(component.users.length).toBe(0);
    expect(toastSpy.success).toHaveBeenCalled();
  }));
});