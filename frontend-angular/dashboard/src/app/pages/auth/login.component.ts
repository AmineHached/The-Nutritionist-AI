import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginPayload } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-header">
        <div class="icon">🥗</div>
        <h2>Bienvenue</h2>
        <p>Connectez-vous à votre compte</p>
      </div>

      <div *ngIf="errorMessage && errorMessage.trim()" class="message error">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage && successMessage.trim()" class="message success">
        {{ successMessage }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
        <div class="form-group">
          <label>Adresse email</label>
          <input
            type="email"
            formControlName="email"
            placeholder="votre@email.com"
          />
          <div
            *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            class="error-text"
          >
            Veuillez entrer une adresse email valide
          </div>
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            formControlName="password"
            placeholder="••••••••"
          />
          <div
            *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            class="error-text"
          >
            Le mot de passe est requis
          </div>
        </div>

        <button
          type="submit"
          class="btn-primary"
          [disabled]="loginForm.invalid || isLoading"
        >
          <span class="btn-text">
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </span>
        </button>
      </form>

      <div class="auth-links">
        <p>Pas encore de compte ?</p>
        <a routerLink="/register" class="btn-secondary">S'inscrire</a>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.disable();

    const payload: LoginPayload = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.successMessage = 'Connexion réussie!';
          setTimeout(() => {
            this.router.navigate(['/dashboard', user.username]);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.loginForm.enable();
          this.errorMessage = error.message || 'Erreur de connexion';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
