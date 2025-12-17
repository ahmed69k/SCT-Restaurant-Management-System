import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService, User } from '../../shared/AuthService';
import { CommonModule } from '@angular/common';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin'
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUser,
      loading: false
    });

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, CommonModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get currentUser from authService', () => {
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should get loading state from authService', () => {
    expect(component.loading).toBe(false);
  });

  it('should display user name in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h2 = compiled.querySelector('.profile-header h2');
    expect(h2?.textContent).toBe('John Doe');
  });

  it('should display first letter of name in avatar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const avatar = compiled.querySelector('.avatar span');
    expect(avatar?.textContent).toBe('J');
  });

  it('should display user role with badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const roleBadge = compiled.querySelector('.role-badge');
    expect(roleBadge?.textContent).toBe('Admin');
  });

  it('should apply lowercase role class to role badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const roleBadge = compiled.querySelector('.role-badge');
    expect(roleBadge?.classList.contains('admin')).toBe(true);
  });

  it('should display user email', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailValue = compiled.querySelector('.detail-value');
    expect(emailValue?.textContent).toBe('john.doe@example.com');
  });

  it('should show profile card when not loading', () => {
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => false
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const profileCard = compiled.querySelector('.profile-card');
    expect(profileCard).toBeTruthy();
  });

  it('should hide profile card when loading', () => {
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => true
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const profileCard = compiled.querySelector('.profile-card');
    expect(profileCard).toBeFalsy();
  });

  it('should show loading message when loading', () => {
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => true
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingText = compiled.querySelector('p');
    expect(loadingText?.textContent).toBe('Loading profile...');
  });

  it('should hide loading message when not loading', () => {
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => false
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const loadingDiv = Array.from(compiled.querySelectorAll('div')).find(
      div => div.textContent?.includes('Loading profile...')
    );
    expect(loadingDiv).toBeFalsy();
  });

  it('should have profile-container wrapper', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.profile-container');
    expect(container).toBeTruthy();
  });

  it('should have profile-header section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.profile-header');
    expect(header).toBeTruthy();
  });

  it('should have profile-details section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const details = compiled.querySelector('.profile-details');
    expect(details).toBeTruthy();
  });

  it('should display "Profile Details" heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h3 = compiled.querySelector('.profile-details h3');
    expect(h3?.textContent).toBe('Profile Details');
  });

  it('should have detail-item container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const detailItem = compiled.querySelector('.detail-item');
    expect(detailItem).toBeTruthy();
  });

  it('should display email label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('.detail-label');
    expect(label?.textContent).toBe('Email: ');
  });

  it('should handle user with different role - Staff', () => {
    const staffUser: User = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Staff'
    };
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => staffUser
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const roleBadge = compiled.querySelector('.role-badge');
    expect(roleBadge?.textContent).toBe('Staff');
    expect(roleBadge?.classList.contains('staff')).toBe(true);
  });

  it('should handle user with different role - User', () => {
    const regularUser: User = {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'User'
    };
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => regularUser
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const roleBadge = compiled.querySelector('.role-badge');
    expect(roleBadge?.textContent).toBe('User');
    expect(roleBadge?.classList.contains('user')).toBe(true);
  });

  it('should display correct avatar letter for different names', () => {
    const userWithA: User = {
      name: 'Alice Wonder',
      email: 'alice@example.com',
      role: 'User'
    };
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => userWithA
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const avatar = compiled.querySelector('.avatar span');
    expect(avatar?.textContent).toBe('A');
  });

  it('should handle null user gracefully with safe navigation', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => null
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const profileCard = compiled.querySelector('.profile-card');
    expect(profileCard).toBeTruthy();
  });

  it('should handle undefined user gracefully with safe navigation', () => {
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => undefined
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const profileCard = compiled.querySelector('.profile-card');
    expect(profileCard).toBeTruthy();
  });

  it('should have avatar element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const avatar = compiled.querySelector('.avatar');
    expect(avatar).toBeTruthy();
  });

  it('should contain avatar span inside avatar div', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const avatar = compiled.querySelector('.avatar');
    const span = avatar?.querySelector('span');
    expect(span).toBeTruthy();
  });

  it('should have correct structure hierarchy', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.profile-container');
    const card = container?.querySelector('.profile-card');
    expect(card).toBeTruthy();
    
    const header = card?.querySelector('.profile-header');
    const details = card?.querySelector('.profile-details');
    expect(header).toBeTruthy();
    expect(details).toBeTruthy();
  });

  

    
  it('should properly bind currentUser getter to authService', () => {
    const newUser: User = {
      name: 'New User',
      email: 'new@example.com',
      role: 'Staff'
    };
    Object.defineProperty(mockAuthService, 'currentUser', {
      get: () => newUser,
      configurable: true
    });

    expect(component.currentUser).toEqual(newUser);
  });

  it('should properly bind loading getter to authService', () => {
    Object.defineProperty(mockAuthService, 'loading', {
      get: () => true,
      configurable: true
    });

    expect(component.loading).toBe(true);
  });
});