import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../../shared/AuthService';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
}

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockMenuItems: MenuItem[] = [
    {
      _id: '1',
      name: 'Burger',
      description: 'Delicious burger',
      price: 10.99,
      category: 'Main',
      image: 'burger.jpg',
      isAvailable: true
    },
    {
      _id: '2',
      name: 'Pizza',
      description: 'Cheesy pizza',
      price: 15.99,
      category: 'Main',
      image: 'pizza.jpg',
      isAvailable: true
    }
  ];

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: { role: 'User', email: 'test@example.com' }
    });
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [MenuComponent, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty menu and form fields', () => {
    expect(component.menu).toEqual([]);
    expect(component.name).toBe('');
    expect(component.description).toBe('');
    expect(component.price).toBeNull();
    expect(component.category).toBe('');
    expect(component.image).toBe('');
    expect(component.isAvailable).toBe(true);
  });

  it('should fetch menu on initialization', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-secret-code')).toBe('1029');
    req.flush(mockMenuItems);

    expect(component.menu).toEqual(mockMenuItems);
  });

  it('should return correct user role', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => ({ role: 'Admin', email: 'admin@example.com' })
    });
    expect(component.userRole).toBe('Admin');
  });

  it('should identify admin users correctly', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => ({ role: 'Admin', email: 'admin@example.com' })
    });
    expect(component.isAdminOrStaff).toBe(true);
  });

  it('should identify staff users correctly', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => ({ role: 'Staff', email: 'staff@example.com' })
    });
    expect(component.isAdminOrStaff).toBe(true);
  });

  it('should identify regular users correctly', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => ({ role: 'User', email: 'user@example.com' })
    });
    expect(component.isAdminOrStaff).toBe(false);
  });

  it('should open modal with selected item', () => {
    const item = mockMenuItems[0];
    component.openModal(item);
    expect(component.selectedItem).toBe(item);
  });

  it('should close modal and reset state', () => {
    component.selectedItem = mockMenuItems[0];
    component.isEditing = true;
    component.name = 'Test';
    component.closeModal();

    expect(component.selectedItem).toBeNull();
    expect(component.isEditing).toBe(false);
    expect(component.editingItem).toBeNull();
    expect(component.name).toBe('');
  });

  it('should open edit form for existing item', () => {
    const item = mockMenuItems[0];
    component.openEdit(item);

    expect(component.isEditing).toBe(true);
    expect(component.editingItem).toBe(item);
    expect(component.name).toBe(item.name);
    expect(component.description).toBe(item.description);
    expect(component.price).toBe(item.price);
    expect(component.category).toBe(item.category);
    expect(component.isAvailable).toBe(item.isAvailable);
  });

  it('should open edit form for new item', () => {
    component.name = 'Old Name';
    component.openEdit(null);

    expect(component.isEditing).toBe(true);
    expect(component.editingItem).toBeNull();
    expect(component.name).toBe('');
    expect(component.description).toBe('');
  });

  it('should delete item successfully', () => {
    component.menu = [...mockMenuItems];
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteItem(mockMenuItems[0]);

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    expect(component.menu.length).toBe(1);
    expect(component.menu[0]._id).toBe('2');
    expect(mockToastService.success).toHaveBeenCalledWith('Menu item deleted!');
  });

  it('should not delete item if user cancels', () => {
    component.menu = [...mockMenuItems];
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteItem(mockMenuItems[0]);

    httpMock.expectNone('http://localhost:3002/api/v1/menu/1');
    expect(component.menu.length).toBe(2);
  });

  it('should handle delete error', () => {
    component.menu = [...mockMenuItems];
    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteItem(mockMenuItems[0]);

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/1');
    req.error(new ErrorEvent('Network error'));

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete item');
  });

  it('should create new menu item', () => {
    component.name = 'New Item';
    component.description = 'New Description';
    component.price = 20;
    component.category = 'Dessert';
    component.image = 'image.jpg';
    component.isAvailable = true;
    component.isEditing = true;
    component.editingItem = null;

    const newItem: MenuItem = {
      _id: '3',
      name: 'New Item',
      description: 'New Description',
      price: 20,
      category: 'Dessert',
      image: 'image.jpg',
      isAvailable: true
    };

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'New Item',
      description: 'New Description',
      price: 20,
      category: 'Dessert',
      image: 'image.jpg',
      isAvailable: true
    });
    req.flush(newItem);

    expect(component.menu).toContain(newItem);
    expect(mockToastService.success).toHaveBeenCalledWith('Menu item added!');
  });

  it('should update existing menu item', () => {
    component.menu = [...mockMenuItems];
    component.isEditing = true;
    component.editingItem = mockMenuItems[0];
    component.name = 'Updated Burger';
    component.description = 'Updated description';
    component.price = 12.99;
    component.category = 'Main';
    component.image = 'burger-new.jpg';
    component.isAvailable = false;

    const updatedItem: MenuItem = {
      _id: '1',
      name: 'Updated Burger',
      description: 'Updated description',
      price: 12.99,
      category: 'Main',
      image: 'burger-new.jpg',
      isAvailable: false
    };

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedItem);

    expect(component.menu[0]).toEqual(updatedItem);
    expect(mockToastService.success).toHaveBeenCalledWith('Menu item updated!');
  });

  it('should handle create error', () => {
    component.name = 'New Item';
    component.isEditing = true;
    component.editingItem = null;

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu');
    req.error(new ErrorEvent('Network error'));

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to create item');
  });

  it('should handle update error', () => {
    component.menu = [...mockMenuItems];
    component.isEditing = true;
    component.editingItem = mockMenuItems[0];
    component.name = 'Updated Burger';

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/1');
    req.error(new ErrorEvent('Network error'));

    expect(mockToastService.error).toHaveBeenCalledWith('Failed to update item');
  });

  it('should clear form correctly', () => {
    component.name = 'Test';
    component.description = 'Test Description';
    component.price = 10;
    component.category = 'Test Category';
    component.image = 'test.jpg';
    component.isAvailable = false;

    component.clearForm();

    expect(component.name).toBe('');
    expect(component.description).toBe('');
    expect(component.price).toBeNull();
    expect(component.category).toBe('');
    expect(component.image).toBe('');
    expect(component.isAvailable).toBe(true);
  });

  

  it('should show admin buttons for admin users', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => ({ role: 'Admin', email: 'admin@example.com' })
    });
    component.menu = mockMenuItems;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector('.admin-actions button');
    expect(addButton?.textContent).toContain('Add Menu Item');
  });

  

  

  it('should not display modal initially', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const modal = compiled.querySelector('.modal');
    expect(modal).toBeFalsy();
  });
});