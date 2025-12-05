import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  menu: any[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMenu();
  }

  fetchMenu() {
    const headers = new HttpHeaders().set('x-secret-code', '1029');
    this.http
      .get<any[]>('http://localhost:3002/api/v1/menu/internal', { headers })
      .subscribe((menuResponse) => {
        this.menu = menuResponse;
      });
  }
}
