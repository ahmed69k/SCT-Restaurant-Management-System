import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/ToastService';
import { AuthService, User } from '../../shared/AuthService';
import { Table } from '../tables/tables.component';

export interface Reservation {
  _id: string;

  date: string | Date;          // API usually returns string
  time: string;
  numberOfGuests: number;

  status: 'Ready' | 'Being Prepared' | 'Pending';

  table?:Table

  customer:User

  createdAt?: string;
  updatedAt?: string;
}


@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {

  // Form fields
  date = '';
  time = '';
  numOfGuests = 0;

  // Admin view
  reservations: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    public authService: AuthService
  ) {}

  get user(): User | null {
    return this.authService.currentUser;
  }

  get isAdmin(): boolean {
    return this.user?.role === 'Admin';
  }
  get isStaff():boolean{
    return this.user?.role ==="Staff"
  }

  get isUser(): boolean {
    return this.user?.role === 'User';
  }

  ngOnInit(): void {
    // Wait until auth finishes
    const interval = setInterval(() => {
      if (!this.authService.loading) {
        this.loading = false;

        if (this.isAdmin || this.isStaff) {
          this.fetchReservations();
        }

        clearInterval(interval);
      }
    }, 50);
  }

  submitForm() {
    const reservation = {
      date: new Date(this.date),
      time: this.time,
      numberOfGuests: this.numOfGuests
    };

    this.http.post<{ message: string }>(
      'http://localhost:3004/api/v1/reservations',
      reservation,
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.toast.success(res.message);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create reservation');
      }
    });
  }

  fetchReservations() {
    this.http.get<{message:string, reservations:Reservation[]}>(
      'http://localhost:3004/api/v1/reservations',
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.reservations = res.reservations;
      },
      error: (err) => {
        this.toast.error('Failed to load reservations');
        console.log(err)
      }
    });
  }
  cancelReservation(id:string){
    this.http.delete<{message:string, reservation:Reservation}>(`http://localhost:3004/api/v1/reservations/${id}`,{withCredentials:true}).subscribe({
      next: res=>{
          const index = this.reservations.findIndex(
          r => r._id === res.reservation._id
        );
        if (index > -1) {
          this.reservations.splice(index, 1); // <-- Angular detects this change
        }

        this.toast.success(res.message)
      }
    })
  }
  approveReservation(id: string) {
    const status = "Being Prepared";

    this.http
      .put<{ message: string; reservation: Reservation }>(
        `http://localhost:3004/api/v1/reservations/${id}`,
        { status },
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          const reservation = this.reservations.find(r => r._id === res.reservation._id);
          if (reservation) {
            reservation.status = res.reservation.status;
          }

          this.toast.success(res.message || 'Reservation approved');
        },
        error: (err) => {
          this.toast.error(err || 'Failed to approve reservation');
        }
      });
  }
  getStatusClass(status: string): string {
  return status.toLowerCase().replace(/ /g, '-');
}
}
