import { Injectable, Injector } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private injector: Injector
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Vérifier si on est dans le navigateur (pas côté serveur)
    if (!isPlatformBrowser(this.injector.get(PLATFORM_ID))) {
      return true; // Autoriser côté serveur pour éviter les erreurs
    }

    // Vérifier si l'utilisateur est connecté (données en localStorage)
    const userEmail = localStorage.getItem('userEmail');
    const userData = localStorage.getItem('userData');

    if (userEmail && userData) {
      // L'utilisateur est authentifié
      // Si on est sur la root path, rediriger vers dashboard avec le username
      if (state.url === '/') {
        const username = localStorage.getItem('username') || userEmail.split('@')[0];
        this.router.navigate(['/dashboard', username]);
        return false;
      }
      return true; // Autorisé
    }

    // L'utilisateur n'est pas authentifié - rediriger vers la page de connexion
    window.location.href = 'http://localhost:3000';
    return false;
  }
}


