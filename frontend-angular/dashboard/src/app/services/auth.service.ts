import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private apiUrl = '/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeUser();
  }

  private initializeUser(): void {
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined' || !localStorage.getItem) return;
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
        let errorMessage = 'Erreur de connexion';
        if (typeof error.error === 'string' && error.error.trim()) {
          errorMessage = error.error;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.statusText) {
          errorMessage = error.statusText;
        }
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
        let errorMessage = 'Erreur d\'inscription';
        if (typeof error.error === 'string' && error.error.trim()) {
          errorMessage = error.error;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.statusText) {
          errorMessage = error.statusText;
        }

        // Handle 409 Conflict specifically for better UX
        if (error.status === 409 && (!errorMessage || errorMessage === 'Conflict')) {
          errorMessage = 'Cet email ou nom d\'utilisateur est déjà utilisé.';
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('username');
      localStorage.removeItem('userData');
    }
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined' || !localStorage.getItem) return null;
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('username', user.username);
      localStorage.setItem('userData', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }
}
