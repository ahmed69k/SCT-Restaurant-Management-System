import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../shared/ToastService';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../shared/AuthService';
import { Router } from '@angular/router';

export interface Feedback {
  _id: string;
  userId: string;
  rating: number;
  comment?: string;
  date: string;
  Reservation: string;
}

@Component({
  selector: 'app-feedbacks',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './feedbacks.component.html',
  styleUrls: ['./feedbacks.component.css']
})
export class FeedbacksComponent implements OnInit {

  feedbacks: Feedback[] = [];
  loading = true;

  constructor(private http: HttpClient, private toast: ToastService, private auth:AuthService, private router:Router) {}

  ngOnInit(): void {
    this.fetchFeedbacks();
  }

  fetchFeedbacks() {
    this.http.get<{feedbacks: Feedback[]}>('http://localhost:3001/api/v1/feedback', { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.feedbacks = res.feedbacks;
          this.loading = false;
        },
        error: () => {
          this.toast.error('Failed to load feedbacks');
          this.loading = false;
        }
      });
  }

  deleteFeedback(feedbackId: string) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    this.http.delete<{message: string}>(`http://localhost:3001/api/v1/feedback/${feedbackId}`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.feedbacks = this.feedbacks.filter(f => f._id !== feedbackId);
          this.toast.success(res.message);
        },
        error: () => {
          this.toast.error('Failed to delete feedback');
        }
      });
  }
}
