import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/AuthService';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], // HttpClientModule is not needed here since HttpClient is provided globally
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email:string = ''
  password:string = ''
  error:string = ''
  constructor(private http: HttpClient, private toast: ToastService, private authService:AuthService, private router:Router){}

  async handleLogin(){
    const userData = {
      email: this.email,
      password: this.password
    }

    this.authService.login(userData)
      .subscribe({
        next: (res)=>{
          console.log("Login successful!",res)
          this.toast.success("Login Successful!")
          this.router.navigate(['/profile'])
        },
        error: (res)=>{
          console.log("Error logging in!")
          if(res.status === 409){
            // this.toast.error("Email or password incorrect!")
            this.error = "Email or password incorrect!"
          }
          else{
            this.toast.error("Error logging in!")
          }
          
        }
      })
  }
}
