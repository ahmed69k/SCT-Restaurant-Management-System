import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService{
    currentUser:any = null
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
                        this.currentUser = user.user
                        this.loading = false
                    },
                    error:(_)=>{
                        this.currentUser = null
                        this.loading = true
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
                    this.currentUser = null
                })
            )
    }
    isLoggedIn():boolean{
        return !!this.currentUser;
    }
}