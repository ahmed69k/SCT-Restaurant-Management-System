import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { AuthService } from './shared/AuthService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Restaurant';
  
  constructor(private authService:AuthService){}

  ngOnInit(): void {
    this.authService.fetchCurrentUser().subscribe({
      next: ()=>{
        console.log("User Loaded!",this.authService.currentUser)
      },
      error: ()=>{
        console.log("No user logged in!")
      }
    })
  }
}
