// TDD Evidence: Tests written first to drive table creation for admin

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TablesComponent } from './tables.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { AuthService } from '../../shared/AuthService';
import { FormsModule } from '@angular/forms';

describe('TablesComponent (US-F-09)', () => {
  let component: TablesComponent;
  let fixture: ComponentFixture<TablesComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [TablesComponent, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: { currentUser: { role: 'Admin' } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TablesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function flushInitialFetch() {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    req.flush({ tables: [] });
  }

  it('should create', fakeAsync(() => {
    flushInitialFetch();
    expect(component).toBeTruthy();
  }));

  it('should create table successfully', fakeAsync(() => {
    flushInitialFetch();

    component.seatingType = 0; // Booth

    component.createTable();

    const postReq = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(postReq.request.method).toBe('POST');
    postReq.flush({ message: 'Table created' });

    // Flush the second fetchTables() called in success handler
    const refreshReq = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    refreshReq.flush({ tables: [{ seatingType: 0 }] });

    tick();
    expect(toastSpy.success).toHaveBeenCalledWith('Table created successfully!');
  }));
});