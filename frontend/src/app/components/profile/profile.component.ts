import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../shared/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent{

  constructor(private authService: AuthService) {}

  get currentUser(){
    return this.authService.currentUser;
  }

  get loading(){
    return this.authService.loading
  }

}