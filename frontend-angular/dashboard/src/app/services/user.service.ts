import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type UserData = {
  id?: number;
  username: string;
  email: string;
  poids: number;
  taille: number;
  age: number;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // Récupère les données utilisateur depuis le localStorage
  getUserFromStorage(): UserData | null {
    // SSR check: localStorage is only available in browser
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined' || !localStorage.getItem) {
      return null;
    }

    // Essayer d'abord de récupérer userData
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }

    // Si userData n'existe pas mais que username existe, créer un objet minimal
    const username = localStorage.getItem('username');
    if (username) {
      return {
        username: username,
        email: (localStorage.getItem('userEmail') || '').split(':')[0],
        poids: 0,
        taille: 0,
        age: 0
      };
    }

    return null;
  }

  // Récupère l'email utilisateur depuis le localStorage
  getUserEmail(): string | null {
    // SSR check: localStorage is only available in browser
    if (!isPlatformBrowser(this.platformId) || typeof localStorage === 'undefined' || !localStorage.getItem) {
      return null;
    }
    return localStorage.getItem('userEmail');
  }

  // Récupère les données utilisateur depuis l'API
  getUserData(email: string): Observable<UserData> {
    return this.http
      .get<UserData>(`${this.apiUrl}/users/email/${encodeURIComponent(email)}`)
      .pipe(catchError(this.handleError));
  }

  // Met à jour le profil utilisateur
  updateUserProfile(userData: UserData): Observable<UserData> {
    return this.http
      .put<UserData>(`${this.apiUrl}/users/${userData.email}`, userData)
      .pipe(catchError(this.handleError));
  }

  // Calcule l'IMC
  calculateBMI(poids: number, taille: number): number {
    const tailleEnMetres = taille / 100;
    return Math.round((poids / (tailleEnMetres * tailleEnMetres)) * 100) / 100;
  }

  private handleError(error: any) {
    console.error('User API error:', error);
    return throwError(() => new Error('Failed to fetch user data'));
  }
}
