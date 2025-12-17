import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  const mockMenu = [
    {
      _id: 'item1',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with herbs',
      image: '/images/salmon.jpg',
      price: 24.99,
      category: 'Main Course'
    },
    {
      _id: 'item2',
      name: 'Caesar Salad',
      description: 'Classic Caesar with croutons',
      image: '/images/salad.jpg',
      price: 12.99,
      category: 'Appetizer'
    },
    {
      _id: 'item3',
      name: 'Chocolate Cake',
      description: 'Decadent chocolate dessert',
      image: '/images/cake.jpg',
      price: 8.99,
      category: 'Dessert'
    },
    {
      _id: 'item4',
      name: 'Steak',
      description: 'Premium ribeye steak',
      image: '/images/steak.jpg',
      price: 34.99,
      category: 'Main Course'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call fetchMenu on initialization', () => {
      spyOn(component, 'fetchMenu');
      
      component.ngOnInit();
      
      expect(component.fetchMenu).toHaveBeenCalled();
    });
  });

  describe('fetchMenu', () => {
    it('should fetch menu successfully with correct headers', () => {
      component.fetchMenu();

      const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('x-secret-code')).toBe('1029');

      req.flush(mockMenu);

      expect(component.menu).toEqual(mockMenu);
    });

    it('should set menu to empty array initially', () => {
      expect(component.menu).toEqual([]);
    });

    it('should handle empty menu response', () => {
      component.fetchMenu();

      const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
      req.flush([]);

      expect(component.menu).toEqual([]);
    });

    it('should update menu array with response data', () => {
      component.fetchMenu();

      const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
      req.flush(mockMenu);

      expect(component.menu.length).toBe(4);
      expect(component.menu[0].name).toBe('Grilled Salmon');
    });
  });

  describe('Template rendering - Hero Section', () => {
    it('should render hero section with title', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const heroTitle = compiled.querySelector('.hero-section h1');
      
      expect(heroTitle?.textContent).toContain('The Golden Plate');
    });

    it('should render tagline', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const tagline = compiled.querySelector('.tagline');
      
      expect(tagline?.textContent).toContain('Experience Culinary Excellence in Every Bite');
    });

    it('should render View Menu button with correct route', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const menuButton = compiled.querySelector('a[routerLink="/menu"]');
      
      expect(menuButton).toBeTruthy();
      expect(menuButton?.textContent?.trim()).toContain('View Our Menu');
    });

    it('should render Book a Table button with correct route', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const bookButton = compiled.querySelector('a[routerLink="/reservations"]');
      
      expect(bookButton).toBeTruthy();
      expect(bookButton?.textContent?.trim()).toContain('Book a Table');
    });
  });

  describe('Template rendering - About Section', () => {
    it('should render about section with story heading', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const aboutHeading = compiled.querySelector('.about-section h2');
      
      expect(aboutHeading?.textContent).toContain('Our Story');
    });

    it('should render about content paragraphs', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const paragraphs = compiled.querySelectorAll('.about-content p');
      
      expect(paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(paragraphs[0]?.textContent).toContain('Founded in 2004');
    });

    it('should render Learn More button', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const learnMoreButton = compiled.querySelector('a[routerLink="/about"]');
      
      expect(learnMoreButton).toBeTruthy();
      expect(learnMoreButton?.textContent?.trim()).toContain('Learn More');
    });

    it('should render about image', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const aboutImage = compiled.querySelector('.about-image img');
      
      expect(aboutImage).toBeTruthy();
      expect(aboutImage?.getAttribute('src')).toBe('/images/resto-busy.jpg');
    });
  });

  describe('Template rendering - Menu Highlights Section', () => {
    it('should render menu highlights heading', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const heading = compiled.querySelector('.menu-highlights-section h2');
      
      expect(heading?.textContent).toContain('Signature Dishes');
    });

    it('should display only first 3 menu items', () => {
      component.menu = mockMenu;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dishCards = compiled.querySelectorAll('.dish-card');
      
      expect(dishCards.length).toBe(3);
    });

    it('should not display menu items when menu is empty', () => {
      component.menu = [];
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dishCards = compiled.querySelectorAll('.dish-card');
      
      expect(dishCards.length).toBe(0);
    });

    it('should render menu item details correctly', () => {
      component.menu = mockMenu;
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const firstCard = compiled.querySelector('.dish-card');
      const itemName = firstCard?.querySelector('h3');
      const itemDescription = firstCard?.querySelector('p');
      const itemImage = firstCard?.querySelector('img');
      
      expect(itemName?.textContent).toContain('Grilled Salmon');
      expect(itemDescription?.textContent).toContain('Fresh Atlantic salmon with herbs');
      expect(itemImage?.getAttribute('src')).toBe('/images/salmon.jpg');
      expect(itemImage?.getAttribute('alt')).toBe('Grilled Salmon');
    });

    it('should render Explore Full Menu button', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const exploreButton = compiled.querySelectorAll('a[routerLink="/menu"]')[1]; // Second menu link
      
      expect(exploreButton).toBeTruthy();
      expect(exploreButton?.textContent?.trim()).toContain('Explore Full Menu');
    });
  });

  describe('Template rendering - Reservations Section', () => {
    it('should render reservations section heading', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const heading = compiled.querySelector('.reservations-section h2');
      
      expect(heading?.textContent).toContain('Make a Reservation');
    });

    it('should render Book Now button', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const bookButton = compiled.querySelectorAll('a[routerLink="/reservations"]')[1]; // Second reservation link
      
      expect(bookButton).toBeTruthy();
      expect(bookButton?.textContent?.trim()).toContain('Book Now');
    });

    it('should render contact email', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const emailLink = compiled.querySelector('a[href="mailto:ahmedassem04@gmail.com"]');
      
      expect(emailLink).toBeTruthy();
      expect(emailLink?.textContent?.trim()).toContain('ahmedassem04@gmail.com');
    });
  });

  describe('Template rendering - Testimonials Section', () => {
    it('should render testimonials section heading', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const heading = compiled.querySelector('.testimonials-section h2');
      
      expect(heading?.textContent).toContain('What Our Guests Say');
    });

    it('should render at least one testimonial card', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const testimonialCards = compiled.querySelectorAll('.testimonial-card');
      
      expect(testimonialCards.length).toBeGreaterThanOrEqual(1);
    });

    it('should render testimonial content', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const testimonialText = compiled.querySelector('.testimonial-card p');
      
      expect(testimonialText?.textContent).toContain('Absolutely incredible food');
    });
  });

  describe('Integration tests', () => {
    it('should fetch menu on component initialization and display items', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
      req.flush(mockMenu);

      fixture.detectChanges(); // Update view with menu data

      const compiled = fixture.nativeElement;
      const dishCards = compiled.querySelectorAll('.dish-card');
      
      expect(component.menu.length).toBe(4);
      expect(dishCards.length).toBe(3); // Only first 3 displayed
    });

    it('should handle menu fetch and display correctly with 2 items', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('http://localhost:3002/api/v1/menu/internal');
      req.flush(mockMenu.slice(0, 2));

      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const dishCards = compiled.querySelectorAll('.dish-card');
      
      expect(dishCards.length).toBe(2);
    });
  });
});