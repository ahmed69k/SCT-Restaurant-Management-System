import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablesComponent, Table, SeatingType } from './tables.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../shared/AuthService';
import { ToastService } from '../../shared/ToastService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('TablesComponent', () => {
  let component: TablesComponent;
  let fixture: ComponentFixture<TablesComponent>;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockAdminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin'
  };

  const mockRegularUser = {
    name: 'Regular User',
    email: 'user@example.com',
    role: 'User'
  };

  const mockTables: any[] = [
    {
      _id: '1',
      isFree: true,
      seatingType: 'Table'
    },
    {
      _id: '2',
      isFree: false,
      seatingType: 'Booth'
    },
    {
      _id: '3',
      isFree: true,
      seatingType: 'Couch'
    }
  ];

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockAdminUser
    });
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TablesComponent, HttpClientTestingModule, CommonModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TablesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty tables array', () => {
    expect(component.tables).toEqual([]);
  });

  it('should initialize with null isFree', () => {
    expect(component.isFree).toBeNull();
  });

  it('should initialize with null seatingType', () => {
    expect(component.seatingType).toBeNull();
  });

  it('should initialize with form hidden', () => {
    expect(component.isFormHidden).toBe(true);
  });

  it('should get currentUser from authService', () => {
    expect(component.currentUser).toEqual(mockAdminUser);
  });

  it('should fetch tables on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ tables: mockTables });

    expect(component.tables).toEqual(mockTables);
  });

  it('should not redirect admin user on init', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockAdminUser
    });

    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3005/api/v1/tables').flush({ tables: [] });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should redirect non-admin user to not-found on init', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => mockRegularUser
    });

    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3005/api/v1/tables').flush({ tables: [] });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/not-found']);
  });

  it('should fetch tables successfully', () => {
    component.fetchTables();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(req.request.method).toBe('GET');
    req.flush({ tables: mockTables });

    expect(component.tables).toEqual(mockTables);
  });

  it('should create table successfully', () => {
    component.seatingType = SeatingType.Table;
    component.isFormHidden = false;

    component.createTable();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ seatingType: SeatingType.Table });
    
    req.flush({ message: 'Table created' });

    const fetchReq = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    fetchReq.flush({ tables: mockTables });

    expect(mockToastService.success).toHaveBeenCalledWith('Table created successfully!');
    expect(component.isFormHidden).toBe(true);
  });

  it('should handle table creation error', () => {
    component.seatingType = SeatingType.Booth;

    component.createTable();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    req.error(new ProgressEvent('error'), { status: 500 });

    expect(mockToastService.error).toHaveBeenCalledWith('Error creating table!');
  });

  it('should toggle form visibility', () => {
    expect(component.isFormHidden).toBe(true);
    
    component.toggleForm();
    expect(component.isFormHidden).toBe(false);
    
    component.toggleForm();
    expect(component.isFormHidden).toBe(true);
  });

  it('should create table with Booth seating type', () => {
    component.seatingType = SeatingType.Booth;

    component.createTable();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(req.request.body.seatingType).toBe(SeatingType.Booth);
    req.flush({ message: 'Success' });
    
    httpMock.expectOne('http://localhost:3005/api/v1/tables').flush({ tables: [] });
  });

  it('should create table with Couch seating type', () => {
    component.seatingType = SeatingType.Couch;

    component.createTable();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(req.request.body.seatingType).toBe(SeatingType.Couch);
    req.flush({ message: 'Success' });
    
    httpMock.expectOne('http://localhost:3005/api/v1/tables').flush({ tables: [] });
  });

  it('should create table with Double seating type', () => {
    component.seatingType = SeatingType.Double;

    component.createTable();

    const req = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(req.request.body.seatingType).toBe(SeatingType.Double);
    req.flush({ message: 'Success' });
    
    httpMock.expectOne('http://localhost:3005/api/v1/tables').flush({ tables: [] });
  });

  it('should render tables list when form is hidden', () => {
    component.isFormHidden = true;
    component.tables = mockTables;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.tables-container');
    expect(container).toBeTruthy();
  });

  it('should render form when form is not hidden', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const formContainer = compiled.querySelector('.table-form-container');
    expect(formContainer).toBeTruthy();
  });

  it('should display page title', () => {
    component.isFormHidden = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.page-title');
    expect(title?.textContent).toBe('Tables List');
  });

  it('should render table cards when tables exist', () => {
    component.isFormHidden = true;
    component.tables = mockTables;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tableCards = compiled.querySelectorAll('.table-card');
    expect(tableCards.length).toBe(3);
  });

  it('should display empty state when no tables', () => {
    component.isFormHidden = true;
    component.tables = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const emptyState = compiled.querySelector('.empty-state');
    expect(emptyState?.textContent).toBe('No tables found.');
  });

  it('should display table seating type', () => {
    component.isFormHidden = true;
    component.tables = [mockTables[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tableType = compiled.querySelector('.table-type');
    expect(tableType?.textContent).toBe('Table');
  });

  it('should apply free class for available tables', () => {
    component.isFormHidden = true;
    component.tables = [mockTables[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.table-icon');
    expect(icon?.classList.contains('free')).toBe(true);
  });

  it('should apply occupied class for unavailable tables', () => {
    component.isFormHidden = true;
    component.tables = [mockTables[1]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.table-icon');
    expect(icon?.classList.contains('occupied')).toBe(true);
  });

  it('should display weekend icon for Couch seating type', () => {
    component.isFormHidden = true;
    component.tables = [{ isFree: true, seatingType: 'Couch' }];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('weekend');
  });

  it('should display weekend icon for Booth seating type', () => {
    component.isFormHidden = true;
    component.tables = [{ isFree: true, seatingType: 'Booth' }];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('weekend');
  });

  it('should display table_chart icon for Table seating type', () => {
    component.isFormHidden = true;
    component.tables = [{ isFree: true, seatingType: 'Table' }];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.material-icons');
    expect(icon?.textContent?.trim()).toBe('table_chart');
  });

  it('should have View and Edit buttons for each table', () => {
    component.isFormHidden = true;
    component.tables = [mockTables[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const viewBtn = compiled.querySelector('.view-btn');
    const editBtn = compiled.querySelector('.edit-btn');
    
    expect(viewBtn?.textContent).toBe('View');
    expect(editBtn?.textContent).toBe('Edit');
  });

  it('should have Add Table button', () => {
    component.isFormHidden = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('.add-btn');
    expect(addBtn?.textContent).toBe('Add Table');
  });

  it('should toggle form when Add Table button is clicked', () => {
    component.isFormHidden = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addBtn = compiled.querySelector('.add-btn') as HTMLButtonElement;
    
    spyOn(component, 'toggleForm');
    addBtn.click();
    
    expect(component.toggleForm).toHaveBeenCalled();
  });

  it('should have Back button in form', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backBtn = compiled.querySelector('.back-btn');
    expect(backBtn?.textContent).toBe('Back');
  });

  it('should have form title', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const formTitle = compiled.querySelector('.table-form h2');
    expect(formTitle?.textContent).toBe('Add New Table');
  });

  it('should have seating type select with all options', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('#seatingType') as HTMLSelectElement;
    const options = select?.querySelectorAll('option');
    
    expect(options?.length).toBe(5); // Including disabled placeholder
    expect(options?.[1].value).toBe('Booth');
    expect(options?.[2].value).toBe('Table');
    expect(options?.[3].value).toBe('Couch');
    expect(options?.[4].value).toBe('Double');
  });

  it('should have disabled placeholder option in select', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const placeholderOption = compiled.querySelector('option[value=""]') as HTMLOptionElement;
    
    expect(placeholderOption).toBeTruthy();
    expect(placeholderOption.disabled).toBe(true);
    expect(placeholderOption.textContent).toBe('Select a seating type');
  });

  it('should have required attribute on select', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('#seatingType') as HTMLSelectElement;
    expect(select.required).toBe(true);
  });

  it('should have Submit button in form', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector('.submit-btn');
    expect(submitBtn?.textContent).toBe('Submit');
  });

  it('should call createTable on form submit', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    spyOn(component, 'createTable');

    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('.table-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(component.createTable).toHaveBeenCalled();
  });

  it('should have label for seating type', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('label[for="seatingType"]');
    expect(label?.textContent).toBe('Select a seating type');
  });

  it('should fetch tables after successful creation', () => {
    component.seatingType = SeatingType.Table;

    component.createTable();

    const createReq = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    createReq.flush({ message: 'Success' });

    const fetchReq = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    expect(fetchReq.request.method).toBe('GET');
    fetchReq.flush({ tables: mockTables });

    expect(component.tables).toEqual(mockTables);
  });

  it('should hide form after successful table creation', () => {
    component.seatingType = SeatingType.Table;
    component.isFormHidden = false;

    component.createTable();

    const createReq = httpMock.expectOne('http://localhost:3005/api/v1/tables');
    createReq.flush({ message: 'Success' });

    httpMock.expectOne('http://localhost:3005/api/v1/tables').flush({ tables: [] });

    expect(component.isFormHidden).toBe(true);
  });

  it('should not hide tables list when form is shown', () => {
    component.isFormHidden = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tablesContainer = compiled.querySelector('.tables-container');
    expect(tablesContainer).toBeFalsy();
  });

  it('should not show form when tables list is shown', () => {
    component.isFormHidden = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const formContainer = compiled.querySelector('.table-form-container');
    expect(formContainer).toBeFalsy();
  });
});