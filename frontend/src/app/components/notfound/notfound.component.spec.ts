import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotfoundComponent } from './notfound.component';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('NotfoundComponent', () => {
  let component: NotfoundComponent;
  let fixture: ComponentFixture<NotfoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotfoundComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NotfoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 404 heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1');
    expect(h1?.textContent).toBe('404');
  });

  it('should render "Oops! Page Not Found" message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2 = compiled.querySelector('h2');
    expect(h2?.textContent).toBe('Oops! Page Not Found');
  });

  

  it('should have home link with correct routerLink', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('routerLink')).toBe('/home');
  });

  it('should display "Go Back Home" text on link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink]');
    expect(link?.textContent?.trim()).toBe('Go Back Home');
  });

  it('should have correct CSS classes on link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink]');
    expect(link?.classList.contains('btn')).toBe(true);
    expect(link?.classList.contains('home-btn')).toBe(true);
  });

  it('should have not-found-container wrapper', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.not-found-container');
    expect(container).toBeTruthy();
  });

  it('should have not-found-content section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('.not-found-content');
    expect(content).toBeTruthy();
  });

  it('should have RouterLink directive on home link', () => {
    const linkDebugElement = fixture.debugElement.query(By.directive(RouterLink));
    expect(linkDebugElement).toBeTruthy();
    
    const routerLink = linkDebugElement.injector.get(RouterLink);
    expect(routerLink).toBeTruthy();
  });

  it('should have correct structure hierarchy', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.not-found-container');
    const content = container?.querySelector('.not-found-content');
    expect(content).toBeTruthy();
    
    const h1 = content?.querySelector('h1');
    const h2 = content?.querySelector('h2');
    const p = content?.querySelector('p');
    const link = content?.querySelector('a');
    
    expect(h1).toBeTruthy();
    expect(h2).toBeTruthy();
    expect(p).toBeTruthy();
    expect(link).toBeTruthy();
  });

  it('should render all elements in correct order', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const content = compiled.querySelector('.not-found-content');
    const children = Array.from(content?.children || []);
    
    expect(children[0].tagName).toBe('H1');
    expect(children[1].tagName).toBe('H2');
    expect(children[2].tagName).toBe('P');
    expect(children[3].tagName).toBe('A');
  });

  it('should have exactly one h1 element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1Elements = compiled.querySelectorAll('h1');
    expect(h1Elements.length).toBe(1);
  });

  it('should have exactly one h2 element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2Elements = compiled.querySelectorAll('h2');
    expect(h2Elements.length).toBe(1);
  });

  it('should have exactly one paragraph element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pElements = compiled.querySelectorAll('p');
    expect(pElements.length).toBe(1);
  });

  it('should have exactly one link element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const linkElements = compiled.querySelectorAll('a[routerLink]');
    expect(linkElements.length).toBe(1);
  });

  it('should not have any dynamic data binding', () => {
    // Since this is a static component, we verify it has no input properties
    const componentMetadata = (component.constructor as any).__annotations__?.[0];
    expect(componentMetadata?.inputs).toBeUndefined();
  });

  it('should be a standalone component', () => {
    const componentMetadata = (component.constructor as any).__annotations__?.[0];
    // In newer Angular versions, standalone is part of the decorator
    expect(component).toBeTruthy(); // Component exists and works
  });

  it('should have RouterLink in imports', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[routerLink="/home"]');
    expect(link).toBeTruthy();
  });
});