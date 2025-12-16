import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/ToastService';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin' | 'Staff';
  timestamp: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  loading = true;

  // For edit form
  showEditForm = false;
  editUserId: string = '';
  editName: string = '';
  editEmail: string = '';
  editRole: 'User' | 'Admin' | 'Staff' = 'User';

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<{message:string, users: User[]}>('http://localhost:3000/api/v1/users', { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.users = res.users;
          this.loading = false;
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to load users');
          this.loading = false;
        }
      });
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    this.http.delete<{message:string}>(`http://localhost:3000/api/v1/users/${id}`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.users = this.users.filter(u => u._id !== id);
        },
        error: (err) => this.toast.error(err.error?.message || 'Failed to delete user')
      });
  }

  openEditForm(user: User) {
    this.showEditForm = true;
    this.editUserId = user._id;
    this.editName = user.name;
    this.editEmail = user.email;
    this.editRole = user.role; // <-- assign the string correctly
  }

  closeEditForm() {
    this.showEditForm = false;
  }

  submitEditForm() {
    const payload = {
      name: this.editName,
      email: this.editEmail,
      role: this.editRole // <-- send the string directly
    };

    this.http.put<{message:string, updatedUser: User}>(`http://localhost:3000/api/v1/users/update/${this.editUserId}`, payload, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.showEditForm = false;
          this.fetchUsers(); // refresh the list
        },
        error: (err) => this.toast.error(err.error?.message || 'Failed to update user')
      });
  }
}
