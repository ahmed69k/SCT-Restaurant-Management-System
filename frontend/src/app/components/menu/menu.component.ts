import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  menu: any[] = [];
  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.getMenu();
  }

  getMenu(){
    const headers = new HttpHeaders().set('x-secret-code', '1029');
    this.http.get<any[]>('http://localhost:3002/api/v1/menu/internal/', { headers }).subscribe(menuResponse => {
      this.menu = menuResponse;
    });
  }
}