import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/AuthService';
import { ToastService } from '../../shared/ToastService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export enum SeatingType {
  Booth,
  Couch,
  Table,
  Double
}

@Component({
  selector: 'app-tables',
  imports: [CommonModule, FormsModule],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.css',
})
export class TablesComponent {
  tables:any[] = [];
  isFree:boolean | null = null;
  seatingType:SeatingType | null = null;
  isFormHidden:boolean = true;
  constructor(private http: HttpClient, private auth:AuthService, private toast:ToastService){}
  ngOnInit():void{
    this.fetchTables()
  }
  fetchTables(){
    this.http.get<{tables:any[]}>('http://localhost:3005/api/v1/tables',{withCredentials: true}).subscribe(tableResponse =>{
      this.tables = tableResponse.tables
    })
  }
  createTable(){
    const payload ={
      seatingType: this.seatingType
    }
    this.http.post('http://localhost:3005/api/v1/tables',payload,{withCredentials:true}).subscribe({
      next: (res) =>{
        console.log("Table created successfully!")
        this.toast.success("Table created successfully!")
        this.fetchTables()
      },
      error: (res) =>{
        console.log("Error creating table!",res)
        this.toast.error("Error creating table!")
      }
    })
 
  }
  toggleForm(){
    this.isFormHidden = !this.isFormHidden
  }
}
