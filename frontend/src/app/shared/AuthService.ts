import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from 'rxjs';

export interface User {
  email: string;
  password?: string; // optional so you don't store plain password
  name: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser:User | null = null
  loading = true;
  token: string = ''; // if backend sets token in response for any reason

  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Fetch current user from backend
  getCurrentUser(): Observable<any> {
    return this.http.get<{message:string, user:User}>(`${this.apiUrl}/profile`, { withCredentials: true });
  }

  fetchCurrentUser(): Observable<any> {
    return this.getCurrentUser().pipe(
      tap({
        next: (res: any) => {
          this.currentUser = res.user
          this.loading = false;
        },
        error: (_) => {
          this.currentUser = null
          this.loading = false;
        }
      })
    );
  }

  // Login user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((res: any) => {
          this.token = res.token || ''; // store token if backend sends it
          // Immediately fetch current user and update state
          this.fetchCurrentUser().subscribe();
        })
      );
  }

  // Logout user
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUser = null
          this.token = '';
        })
      );
  }

  // Check login status
  isLoggedIn(): boolean {
    return !!this.currentUser 
  }
}
