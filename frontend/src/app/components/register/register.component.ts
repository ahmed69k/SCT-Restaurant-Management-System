import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink], // HttpClientModule is not needed here since HttpClient is provided globally
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name:string = ''
  email:string = ''
  password: string = ''
  role:string = ''
  error:string = ''

  constructor(private http: HttpClient, private toast:ToastService){}

  async handleRegister(){
    const userData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    }

    this.http.post('http://localhost:3000/api/v1/register',userData)
      .subscribe({
        next:(response) =>{
          console.log("Register Success", response)
          this.toast.success("Registration Sucessful!")
        },
        error: (response)=>{
          console.log("Error registering!",response)
          if(response.status = 409){
            this.toast.error('Email already in use!')
            this.error = "Email already in use!"
          }
          else{
            this.toast.error("Error registering!")
          }
        }
      })

  }
}
