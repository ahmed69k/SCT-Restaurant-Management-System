import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/ToastService';
import { AuthService, User } from '../../shared/AuthService';
import { Table } from '../tables/tables.component';

export interface Reservation {
  _id: string;
  date: string | Date;
  time: string;
  numberOfGuests: number;
  status: 'Ready' | 'Being Prepared' | 'Pending';
  table?: Table;
  customer: User;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css'],
})
export class ReservationsComponent implements OnInit {

  // Form fields
  date = '';
  time = '';
  numOfGuests = 0;

  // Data
  reservations: Reservation[] = [];
  myReservations: Reservation[] = [];
  loading = true;

  // Prevent past date selection
  today: string = '';

  // ================= FEEDBACK STATE =================
  showFeedbackModal = false;
  selectedReservationId: string | null = null;
  feedbackRating = 5;
  feedbackComment = '';

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

  get isStaff(): boolean {
    return this.user?.role === 'Staff';
  }

  get isUser(): boolean {
    return this.user?.role === 'User';
  }

  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];

    const interval = setInterval(() => {
      if (!this.authService.loading) {
        this.loading = false;

        if (this.isAdmin || this.isStaff) {
          this.fetchReservations();
        }

        if (this.isUser) {
          this.fetchMyReservations();
        }

        clearInterval(interval);
      }
    }, 50);
  }

  // ================= RESERVATIONS =================

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
        this.fetchMyReservations();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create reservation');
      }
    });
  }

  fetchReservations() {
    this.http.get<{ message: string; reservations: Reservation[] }>(
      'http://localhost:3004/api/v1/reservations',
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.reservations = res.reservations;
      },
      error: () => {
        this.toast.error('Failed to load reservations');
      }
    });
  }

  fetchMyReservations() {
    this.http.get<{ message: string; reservations: Reservation[] }>(
      'http://localhost:3004/api/v1/reservations/my',
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.myReservations = res.reservations;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to load your reservations');
      }
    });
  }

  approveReservation(id: string) {
    this.http.put<{ message: string; reservation: Reservation }>(
      `http://localhost:3004/api/v1/reservations/${id}`,
      { status: 'Being Prepared' },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        const r = this.reservations.find(x => x._id === res.reservation._id);
        if (r) r.status = res.reservation.status;
        this.toast.success(res.message);
      }
    });
  }

  cancelReservation(id: string) {
    this.http.delete<{ message: string; reservation: Reservation }>(
      `http://localhost:3004/api/v1/reservations/${id}`,
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.reservations = this.reservations.filter(r => r._id !== res.reservation._id);
        this.toast.success(res.message);
      }
    });
  }

  // ================= FEEDBACK =================

  giveFeedback(reservationId: string) {
    this.selectedReservationId = reservationId;
    this.feedbackRating = 5;
    this.feedbackComment = '';
    this.showFeedbackModal = true;
  }

  closeFeedbackModal() {
    this.showFeedbackModal = false;
    this.selectedReservationId = null;
  }

  submitFeedback() {
    if (!this.selectedReservationId) return;

    // Add validation to ensure the comment is not empty
    if (!this.feedbackComment || this.feedbackComment.trim() === '') {
      this.toast.error('Please enter a comment before submitting.');
      return;
    }

    this.http.post(
      'http://localhost:3001/api/v1/feedback',
      {
        rating: this.feedbackRating,
        comment: this.feedbackComment,
        reservationId: this.selectedReservationId
      },
      { withCredentials: true }
    ).subscribe({
      next: (res: any) => {
        this.toast.success(res.message);
        this.closeFeedbackModal();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to submit feedback');
      }
    });
  }

  // ================= HELPERS =================

  isPastReservation(date: string | Date, time?: string): boolean {
    const reservationDate = new Date(date);

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      reservationDate.setHours(hours, minutes, 0, 0);
    }

    return new Date() > reservationDate;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/ /g, '-');
  }
}
