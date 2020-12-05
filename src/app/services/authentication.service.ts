import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    public apiUrl: string = environment.apiRoot;
    token: any;
    constructor(private http: HttpClient, private router: Router) {
        this.currentUserSubject = new BehaviorSubject<User>(this.getUserFromLocalStorage());
        this.currentUser = this.currentUserSubject.asObservable();
        this.token = this.getUserFromLocalStorage()?.token;
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string, isAdmin: boolean) {
        return this.http.post<any>(`${this.apiUrl}/api/v1/signin`, { email, password, isAdmin })
            .pipe(map(user => {
                // login successful if there's a jwt token in the response
                if (user && user.token) {
                    this.token = user.token;
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/account/login'])
    }
    public authHeaders() {
        // create authorization header with our jwt token
        if (this.token) {
            let headers = new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });
            return headers;
        }
    }
    getUserFromLocalStorage() {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    public replaceAll(input: string, find: string, replace: string): string {
        return input.replace(new RegExp(find, 'g'), replace);
    }
}
