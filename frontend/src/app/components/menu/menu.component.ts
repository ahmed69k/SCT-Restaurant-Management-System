import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/AuthService';
import { ToastService } from '../../shared/ToastService';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  menu: MenuItem[] = [];
  selectedItem: MenuItem | null = null; // For modal
  isEditing: boolean = false;
  editingItem: MenuItem | null = null;

  // Form fields for create/update
  name = '';
  description = '';
  price: number | null = null;
  category = '';
  image = '';
  isAvailable = true;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private toast: ToastService
  ) {}

  get userRole() {
    return this.authService.currentUser?.role;
  }

  get isAdminOrStaff() {
    return this.userRole === 'Admin' || this.userRole === 'Staff';
  }

  ngOnInit(): void {
    this.fetchMenu();
  }

  fetchMenu() {
    const headers = new HttpHeaders().set('x-secret-code', '1029');
    this.http
      .get<MenuItem[]>('http://localhost:3002/api/v1/menu/internal/', { headers })
      .subscribe({
        next: (res) => (this.menu = res),
        error: (err) => console.error(err),
      });
  }

  openModal(item: MenuItem) {
    this.selectedItem = item;
  }

  closeModal() {
    this.selectedItem = null;
    this.isEditing = false;
    this.editingItem = null;
    this.clearForm();
  }

  openEdit(item: MenuItem | null) {
    this.isEditing = true;
    this.editingItem = item;

    if (item) {
      // Editing an existing item
      this.name = item.name;
      this.description = item.description;
      this.price = item.price;
      this.category = item.category;
      this.image = item.image || '';
      this.isAvailable = item.isAvailable;
    } else {
      // Creating a new item
      this.clearForm();
    }
  }


  deleteItem(item: MenuItem) {
    if (!confirm(`Delete ${item.name}?`)) return;
    this.http
      .delete(`http://localhost:3002/api/v1/menu/${item._id}`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.menu = this.menu.filter((m) => m._id !== item._id);
          this.toast.success('Menu item deleted!');
        },
        error: (err) => this.toast.error('Failed to delete item'),
      });
  }

  submitForm() {
    const payload = { name: this.name, description: this.description, price: this.price, category: this.category, image: this.image, isAvailable: this.isAvailable };
    if (this.isEditing && this.editingItem) {
      this.http
        .put(`http://localhost:3002/api/v1/menu/${this.editingItem._id}`, payload, { withCredentials: true })
        .subscribe({
          next: (res: any) => {
            const index = this.menu.findIndex((m) => m._id === this.editingItem?._id);
            if (index > -1) this.menu[index] = res;
            this.toast.success('Menu item updated!');
            this.closeModal();
          },
          error: () => this.toast.error('Failed to update item'),
        });
    } else {
      this.http.post(`http://localhost:3002/api/v1/menu`, payload, { withCredentials: true }).subscribe({
        next: (res: any) => {
          this.menu.push(res);
          this.toast.success('Menu item added!');
          this.closeModal();
        },
        error: () => this.toast.error('Failed to create item'),
      });
    }
  }

  clearForm() {
    this.name = '';
    this.description = '';
    this.price = null;
    this.category = '';
    this.image = '';
    this.isAvailable = true;
  }
}
