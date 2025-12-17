import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent, User } from './users.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let httpMock: HttpTestingController;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockUsers: User[] = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'User',
      timestamp: '2025-01-01T10:00:00Z'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Admin',
      timestamp: '2025-01-02T11:00:00Z'
    },
    {
      _id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'Staff',
      timestamp: '2025-01-03T12:00:00Z'
    }
  ];

  beforeEach(async () => {
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [UsersComponent, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty users array', () => {
    expect(component.users).toEqual([]);
  });

  it('should initialize with loading true', () => {
    expect(component.loading).toBe(true);
  });

  it('should initialize with showEditForm false', () => {
    expect(component.showEditForm).toBe(false);
  });

  it('should initialize with empty edit form fields', () => {
    expect(component.editUserId).toBe('');
    expect(component.editName).toBe('');
    expect(component.editEmail).toBe('');
    expect(component.editRole).toBe('User');
  });

  it('should fetch users on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ message: 'Success', users: mockUsers });

    expect(component.users).toEqual(mockUsers);
    expect(component.loading).toBe(false);
  });

  it('should handle fetch users error', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    req.error(new ProgressEvent('error'), { status: 500 });

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to load users');
    expect(component.loading).toBe(false);
  });

  it('should handle fetch users error with custom message', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    req.flush({ message: 'Custom error' }, { status: 500, statusText: 'Server Error' });

    expect(component.loading).toBe(false);
  });

  it('should fetch users successfully', () => {
    component.fetchUsers();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users');
    req.flush({ message: 'Success', users: mockUsers });

    expect(component.users).toEqual(mockUsers);
    expect(component.loading).toBe(false);
  });

  it('should delete user successfully after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.users = [...mockUsers];

    component.deleteUser('1');

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ message: 'User deleted successfully' });

    expect(component.users.length).toBe(2);
    expect(component.users.find(u => u._id === '1')).toBeUndefined();
    expect(mockToastService.success).toHaveBeenCalledWith('User deleted successfully');
  });

  it('should not delete user if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.users = [...mockUsers];

    component.deleteUser('1');

    httpMock.expectNone('http://localhost:3000/api/v1/users/1');
    expect(component.users.length).toBe(3);
  });

  it('should handle delete user error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.users = [...mockUsers];

    component.deleteUser('1');

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/1');
    req.error(new ProgressEvent('error'), { status: 500 });

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete user');
  });

  it('should open edit form with user data', () => {
    const user = mockUsers[0];
    component.openEditForm(user);

    expect(component.showEditForm).toBe(true);
    expect(component.editUserId).toBe('1');
    expect(component.editName).toBe('John Doe');
    expect(component.editEmail).toBe('john@example.com');
    expect(component.editRole).toBe('User');
  });

  it('should open edit form with admin user data', () => {
    const user = mockUsers[1];
    component.openEditForm(user);

    expect(component.showEditForm).toBe(true);
    expect(component.editUserId).toBe('2');
    expect(component.editName).toBe('Jane Smith');
    expect(component.editEmail).toBe('jane@example.com');
    expect(component.editRole).toBe('Admin');
  });

  it('should open edit form with staff user data', () => {
    const user = mockUsers[2];
    component.openEditForm(user);

    expect(component.showEditForm).toBe(true);
    expect(component.editUserId).toBe('3');
    expect(component.editName).toBe('Bob Johnson');
    expect(component.editEmail).toBe('bob@example.com');
    expect(component.editRole).toBe('Staff');
  });

  it('should close edit form', () => {
    component.showEditForm = true;
    component.closeEditForm();

    expect(component.showEditForm).toBe(false);
  });

  it('should submit edit form successfully', () => {
    component.editUserId = '1';
    component.editName = 'Updated Name';
    component.editEmail = 'updated@example.com';
    component.editRole = 'Admin';

    component.submitEditForm();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/update/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({
      name: 'Updated Name',
      email: 'updated@example.com',
      role: 'Admin'
    });

    const updatedUser: User = {
      _id: '1',
      name: 'Updated Name',
      email: 'updated@example.com',
      role: 'Admin',
      timestamp: '2025-01-01T10:00:00Z'
    };

    req.flush({ message: 'User updated successfully', updatedUser });

    const fetchReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    fetchReq.flush({ message: 'Success', users: [updatedUser] });

    expect(mockToastService.success).toHaveBeenCalledWith('User updated successfully');
    expect(component.showEditForm).toBe(false);
  });

  it('should handle edit form submission error', () => {
    component.editUserId = '1';
    component.editName = 'Updated Name';
    component.editEmail = 'updated@example.com';
    component.editRole = 'Admin';

    component.submitEditForm();

    const req = httpMock.expectOne('http://localhost:3000/api/v1/users/update/1');
    req.error(new ProgressEvent('error'), { status: 500 });

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to update user');
  });

  

  it('should hide loading message when not loading', () => {
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingDiv = compiled.querySelector('.loading');
    expect(loadingDiv).toBeFalsy();
  });

  

 

  it('should render users table when users exist', () => {
    component.loading = false;
    component.users = mockUsers;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('.admin-table');
    expect(table).toBeTruthy();
  });

  


  it('should display "No users found" when users array is empty', () => {
    component.loading = false;
    component.users = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const noUsers = compiled.querySelector('p');
    expect(noUsers?.textContent).toBe('No users found.');
  });

  it('should have Edit and Delete buttons for each user', () => {
    component.loading = false;
    component.users = [mockUsers[0]];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const editBtn = compiled.querySelector('.btn.primary');
    const deleteBtn = compiled.querySelector('.btn.delete');
    
    expect(editBtn?.textContent).toBe('Edit');
    expect(deleteBtn?.textContent).toBe('Delete');
  });

  it('should show edit form modal when showEditForm is true', () => {
    component.loading = false;
    component.showEditForm = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('.modal-backdrop');
    expect(modal).toBeTruthy();
  });

  

  it('should render edit form title', () => {
    component.loading = false;
    component.showEditForm = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const modalTitle = compiled.querySelector('.modal h2');
    expect(modalTitle?.textContent).toBe('Edit User');
  });

  it('should have all form fields in edit modal', () => {
    component.loading = false;
    component.showEditForm = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('input[name="editName"]');
    const emailInput = compiled.querySelector('input[name="editEmail"]');
    const roleSelect = compiled.querySelector('select[name="editRole"]');
    
    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(roleSelect).toBeTruthy();
  });

  

  

  it('should have correct input types in edit form', () => {
    component.loading = false;
    component.showEditForm = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector('input[name="editName"]') as HTMLInputElement;
    const emailInput = compiled.querySelector('input[name="editEmail"]') as HTMLInputElement;
    
    expect(nameInput.type).toBe('text');
    expect(emailInput.type).toBe('email');
  });

  it('should have table headers', () => {
    component.loading = false;
    component.users = mockUsers;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('th');
    
    expect(headers[0].textContent).toBe('Name');
    expect(headers[1].textContent).toBe('Email');
    expect(headers[2].textContent).toBe('Role');
    expect(headers[3].textContent).toBe('Joined');
    expect(headers[4].textContent).toBe('Actions');
  });

  it('should call openEditForm when Edit button is clicked', () => {
    component.loading = false;
    component.users = [mockUsers[0]];
    fixture.detectChanges();

    spyOn(component, 'openEditForm');

    const compiled = fixture.nativeElement as HTMLElement;
    const editBtn = compiled.querySelector('.btn.primary') as HTMLButtonElement;
    editBtn.click();

    expect(component.openEditForm).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should call deleteUser when Delete button is clicked', () => {
    component.loading = false;
    component.users = [mockUsers[0]];
    fixture.detectChanges();

    spyOn(component, 'deleteUser');

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteBtn = compiled.querySelector('.btn.delete') as HTMLButtonElement;
    deleteBtn.click();

    expect(component.deleteUser).toHaveBeenCalledWith('1');
  });

  it('should call closeEditForm when Cancel button is clicked', () => {
    component.loading = false;
    component.showEditForm = true;
    fixture.detectChanges();

    spyOn(component, 'closeEditForm');

    const compiled = fixture.nativeElement as HTMLElement;
    const cancelBtn = compiled.querySelectorAll('.modal-actions button')[0] as HTMLButtonElement;
    cancelBtn.click();

    expect(component.closeEditForm).toHaveBeenCalled();
  });

  it('should call submitEditForm when Save button is clicked', () => {
    component.loading = false;
    component.showEditForm = true;
    fixture.detectChanges();

    spyOn(component, 'submitEditForm');

    const compiled = fixture.nativeElement as HTMLElement;
    const saveBtn = compiled.querySelectorAll('.modal-actions button')[1] as HTMLButtonElement;
    saveBtn.click();

    expect(component.submitEditForm).toHaveBeenCalled();
  });

  it('should refresh user list after successful update', () => {
    component.editUserId = '1';
    component.editName = 'Updated Name';
    component.editEmail = 'updated@example.com';
    component.editRole = 'Staff';

    component.submitEditForm();

    const updateReq = httpMock.expectOne('http://localhost:3000/api/v1/users/update/1');
    updateReq.flush({ message: 'Success', updatedUser: mockUsers[0] });

    const fetchReq = httpMock.expectOne('http://localhost:3000/api/v1/users');
    expect(fetchReq.request.method).toBe('GET');
    fetchReq.flush({ message: 'Success', users: mockUsers });
  });
});