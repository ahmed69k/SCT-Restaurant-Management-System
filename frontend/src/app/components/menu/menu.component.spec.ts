// TDD Evidence: Tests written first to drive menu fetching, create, update, delete for admin

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastService } from '../../shared/ToastService';
import { AuthService } from '../../shared/AuthService';
import { FormsModule } from '@angular/forms';

describe('MenuComponent (US-F-06, US-F-07)', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let httpMock: HttpTestingController;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [MenuComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: ToastService, useValue: toastSpy },
        { provide: AuthService, useValue: { currentUser: { role: 'Admin' } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    fixture.detectChanges(); // trigger ngOnInit
    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/');
    req.flush([]); // flush initial load
    expect(component).toBeTruthy();
  });

  it('should fetch menu on init (US-F-06)', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/');
    const mockMenu = [{
      _id: '1',
      name: 'Pizza',
      description: 'Delicious',
      price: 100,
      category: 'Main',
      isAvailable: true
    }];
    req.flush(mockMenu);

    tick();
    expect(component.menu).toEqual(mockMenu);
  }));

  it('should add new menu item (US-F-07)', fakeAsync(() => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/').flush([]);

    component.name = 'Burger';
    component.description = 'Juicy';
    component.price = 80;
    component.category = 'Main';
    component.isAvailable = true;

    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu');
    req.flush({
      _id: '2',
      name: 'Burger',
      description: 'Juicy',
      price: 80,
      category: 'Main',
      isAvailable: true
    });

    tick();
    expect(component.menu.length).toBe(1);
    expect(toastSpy.success).toHaveBeenCalledWith('Menu item added!');
  }));

  it('should update existing menu item', fakeAsync(() => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/').flush([]);

    const existing = {
      _id: '1',
      name: 'Pizza',
      description: 'Old',
      price: 100,
      category: 'Main',
      isAvailable: true
    };
    component.menu = [existing];
    component.openEdit(existing);

    component.name = 'Updated Pizza';
    component.price = 120;
    component.submitForm();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/1');
    req.flush({
      _id: '1',
      name: 'Updated Pizza',
      description: 'Old',
      price: 120,
      category: 'Main',
      isAvailable: true
    });

    tick();
    expect(component.menu[0].name).toBe('Updated Pizza');
    expect(toastSpy.success).toHaveBeenCalledWith('Menu item updated!');
  }));

  it('should delete menu item when confirmed', fakeAsync(() => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/').flush([]);

    const mockItem = {
      _id: '1',
      name: 'Pizza',
      description: 'Test',
      price: 100,
      category: 'Main',
      isAvailable: true
    };
    component.menu = [mockItem];

    spyOn(window, 'confirm').and.returnValue(true);

    component.deleteItem(mockItem);

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/1');
    req.flush({});

    tick();
    expect(component.menu.length).toBe(0);
    expect(toastSpy.success).toHaveBeenCalledWith('Menu item deleted!');
  }));

  it('should not delete if confirm cancelled', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:3002/api/v1/menu/internal/').flush([]);

    const mockItem = {
      _id: '1',
      name: 'Pizza',
      description: 'Test',
      price: 100,
      category: 'Main',
      isAvailable: true
    };
    component.menu = [mockItem];

    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteItem(mockItem);

    httpMock.expectNone('http://localhost:3002/api/v1/menu/1');
    expect(component.menu.length).toBe(1);
  });
});