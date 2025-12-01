import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { AuthService } from './shared/AuthService';
import { NavbarComponent } from "./shared/navbar/navbar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule, NavbarComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Restaurant';
  
  constructor(private authService:AuthService){}

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe(user =>{
      console.log("User updated from the AppComponent:",user)
    })
    this.authService.fetchCurrentUser().subscribe()
  }
}
