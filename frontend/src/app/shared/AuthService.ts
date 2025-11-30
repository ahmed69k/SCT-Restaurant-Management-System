import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User{
    email:string,
    password:string,
    name:string,
    role:string
}

@Injectable({providedIn: 'root'})
export class AuthService{
    currentUser = new BehaviorSubject<User | null>(null);
    loading = true;

    constructor(private http: HttpClient){}

    getCurrentUser(){
        return this.http.get("http://localhost:3000/api/v1/profile",{
            withCredentials:true
        })
    }

    fetchCurrentUser():Observable<any>{
        return this.http.get("http://localhost:3000/api/v1/profile", {withCredentials:true})
            .pipe(
                tap({
                    next:(user:any)=>{
                        this.currentUser.next(user.user)
                        this.loading = false
                    },
                    error:(_)=>{
                        this.currentUser.next(null)
                        this.loading = false
                    }
                })
            )
    }
    login(credentials: {email:string, password:string}):Observable<any>{
        return this.http.post('http://localhost:3000/api/v1/login',credentials,{withCredentials:true})
            .pipe(
                tap((res:any)=>{
                    this.fetchCurrentUser().subscribe()
                })
            )
    }
    logout():Observable<any>{
        return this.http.post("http://localhost:3000/api/v1/logout",{},{withCredentials:true})
            .pipe(
                tap(()=>{
                    this.currentUser.next(null)
                })
            )

    }
    isLoggedIn():boolean{
        return !!this.currentUser;
    }
}