import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../AuthService';
import { Subscription } from 'rxjs';
import { ToastService } from '../ToastService';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User|null= null;
  private userSubscription: Subscription | undefined;

  constructor(private authService: AuthService, private router: Router, private toast:ToastService) {}

  get user(){
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.currentUser = this.user;
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn()
  }

  logout() {
    this.authService.logout().subscribe({
      next: ()=>{
        this.toast.success("Logged Out!")
      }
    })
  }
}
