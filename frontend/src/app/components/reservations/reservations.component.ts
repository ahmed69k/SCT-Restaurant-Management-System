import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ToastService } from '../../shared/ToastService';
import { AuthService } from '../../shared/AuthService';

@Component({
  selector: 'app-reservations',
  imports: [FormsModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css',
})
export class ReservationsComponent {
  date:string = ''
  time:string = ''
  numOfGuests:number = 0
  constructor(private http:HttpClient, private toast:ToastService, private authService:AuthService){}
  submitForm(){
    const reservation = {
      date: new Date(this.date),
      time: this.time,
      numberOfGuests: this.numOfGuests
    }
    console.log(reservation)
    this.http.post('http://localhost:3004/api/v1/reservations', reservation, {withCredentials:true}).subscribe({
      next: (res)=>{
        console.log("Reservation created!")
        this.toast.success("Reservation created!")
      },
      error: (response) =>{
        console.log("Error creating reservation!", response)
        this.toast.error("Error creating reservation!")
      }
    })
  }

}
