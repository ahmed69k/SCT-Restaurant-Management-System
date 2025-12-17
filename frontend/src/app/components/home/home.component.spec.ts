// TDD Evidence: Tests written first to drive menu display on home page

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from '../../app.routes';  // Fixes ActivatedRoute

describe('HomeComponent (US-F-06)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes)  // Fixes ActivatedRoute error
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
    expect(req.request.headers.get('x-secret-code')).toBe('1029');
    req.flush([]);

    tick();
    expect(component).toBeTruthy();
  }));

  it('should load menu on init', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-secret-code')).toBe('1029');

    const mockMenu = [
      { _id: '1', name: 'Pizza', description: 'Delicious', price: 100, category: 'Main', isAvailable: true }
    ];
    req.flush(mockMenu);

    tick();
    expect(component.menu).toEqual(mockMenu);
  }));
});