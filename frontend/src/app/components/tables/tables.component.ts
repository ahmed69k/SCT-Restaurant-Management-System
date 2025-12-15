import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/AuthService';
import { ToastService } from '../../shared/ToastService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


export enum SeatingType {
  Booth,
  Couch,
  Table,
  Double
}

export interface Table{
  isFree:boolean,
  seatingType:SeatingType
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
  constructor(private http: HttpClient, private auth:AuthService, private toast:ToastService, private router:Router){}
  ngOnInit():void{
    this.fetchTables()
    if(this.currentUser?.role !=="Admin"){
      this.router.navigate(['/not-found'])
    }
  }
  get currentUser(){
    return this.auth.currentUser
  }
  fetchTables(){
    this.http.get<{tables:Table[]}>('http://localhost:3005/api/v1/tables',{withCredentials: true}).subscribe(tableResponse =>{
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
