import axios from 'axios'
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/ToastService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  name:string = ''
  email:string = ''
  password: string = ''
  role:string = ''

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
          this.toast.show("Registration Sucessful!")
        },
        error: (response)=>{
          console.log("Error registering!",response)
          this.toast.show("Register Failed!")
        }
      })

  }
}
