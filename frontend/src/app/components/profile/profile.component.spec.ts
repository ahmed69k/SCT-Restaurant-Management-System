// TDD Evidence: Tests written to drive profile display based on auth state

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../shared/AuthService';

describe('ProfileComponent (US-F-10)', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin'
  };

  it('should create and display current user when logged in', () => {
    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { 
          provide: AuthService, 
          useValue: { 
            currentUser: { name: 'John', email: 'john@test.com', role: 'User' },
            loading: false 
          } 
        }
      ]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentUser!.name).toBe('John');
    expect(component.currentUser!.email).toBe('john@test.com');
    expect(component.currentUser!.role).toBe('User');
    expect(component.loading).toBeFalse();
  });

  it('should show loading state when auth is loading', () => {
    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { 
          provide: AuthService, 
          useValue: { 
            currentUser: null,
            loading: true 
          } 
        }
      ]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentUser).toBeNull();
    expect(component.loading).toBeTrue();
  });

  it('should handle no user logged in', () => {
    TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { 
          provide: AuthService, 
          useValue: { 
            currentUser: null,
            loading: false 
          } 
        }
      ]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentUser).toBeNull();
    expect(component.loading).toBeFalse();
  });
});