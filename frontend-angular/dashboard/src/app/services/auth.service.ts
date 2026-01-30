import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  email: string;
  poids?: number;
  taille?: number;
  age?: number;
  createdAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  poids: number;
  taille: number;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        localStorage.removeItem('userData');
      }
    }
  }

  login(payload: LoginPayload): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, payload).pipe(
      tap(user => {
        this.setUserData(user);
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.statusText || 'Erreur de connexion';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, payload).pipe(
      tap(user => {
        this.setUserData(user);
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.statusText || 'Erreur d\'inscription';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private setUserData(user: User): void {
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('username', user.username);
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
