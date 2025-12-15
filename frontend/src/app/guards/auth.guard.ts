import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../shared/AuthService';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles: string[] = route.data['roles']|| [];

    // If user is still loading, wait for it
    if (this.authService.loading) {
      return this.authService.fetchCurrentUser().pipe(
        map(() => this.checkAccess(allowedRoles)),
        catchError(() => of(this.router.createUrlTree(['/not-found'])))
      );
    }

    return this.checkAccess(allowedRoles);
  }

  private checkAccess(roles: string[]): boolean | UrlTree {
    const user = this.authService.currentUser;

    if (!user) {
      return this.router.createUrlTree(['/login']); // Not logged in
    }

    if (roles.length && !roles.includes(user.role)) {
      return this.router.createUrlTree(['/not-found']); // Role not allowed
    }

    return true;
  }
}
