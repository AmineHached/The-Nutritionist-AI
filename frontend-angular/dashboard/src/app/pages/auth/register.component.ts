import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, RegisterPayload } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-header">
        <div class="icon">🥗</div>
        <h2>Créer votre compte</h2>
        <p>Rejoignez notre communauté nutrition</p>
      </div>

      <div *ngIf="errorMessage" class="message error" [@.trigger]="'enter'">
        {{ errorMessage }}
      </div>
      <div *ngIf="successMessage" class="message success" [@.trigger]="'enter'">
        {{ successMessage }}
      </div>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
        <div class="form-group">
          <label>Nom complet</label>
          <input
            type="text"
            formControlName="username"
            placeholder="Votre nom"
            [disabled]="isLoading"
          />
          <div
            *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
            class="error-text"
          >
            Le nom est requis
          </div>
        </div>

        <div class="form-group">
          <label>Adresse email</label>
          <input
            type="email"
            formControlName="email"
            placeholder="votre@email.com"
            [disabled]="isLoading"
          />
          <div
            *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
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
            [disabled]="isLoading"
          />
          <div
            *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            class="error-text"
          >
            Le mot de passe doit contenir au moins 6 caractères
          </div>
        </div>

        <div class="form-group">
          <label>Poids (kg)</label>
          <input
            type="number"
            formControlName="poids"
            placeholder="70.5"
            step="0.1"
            min="30"
            max="300"
            [disabled]="isLoading"
          />
          <div
            *ngIf="registerForm.get('poids')?.invalid && registerForm.get('poids')?.touched"
            class="error-text"
          >
            Le poids doit être entre 30 et 300 kg
          </div>
        </div>

        <div class="form-group">
          <label>Taille (cm)</label>
          <input
            type="number"
            formControlName="taille"
            placeholder="175"
            min="100"
            max="250"
            [disabled]="isLoading"
          />
          <div
            *ngIf="registerForm.get('taille')?.invalid && registerForm.get('taille')?.touched"
            class="error-text"
          >
            La taille doit être entre 100 et 250 cm
          </div>
        </div>

        <div class="form-group">
          <label>Âge</label>
          <input
            type="number"
            formControlName="age"
            placeholder="25"
            min="13"
            max="120"
            [disabled]="isLoading"
          />
          <div
            *ngIf="registerForm.get('age')?.invalid && registerForm.get('age')?.touched"
            class="error-text"
          >
            L'âge doit être entre 13 et 120 ans
          </div>
        </div>

        <button
          type="submit"
          class="btn-primary"
          [disabled]="registerForm.invalid || isLoading"
        >
          <span class="btn-text">
            {{ isLoading ? 'Inscription en cours...' : 'S\'inscrire' }}
          </span>
        </button>
      </form>

      <div class="auth-links">
        <p>Déjà inscrit ?</p>
        <a href="/login" class="btn-secondary">Se connecter</a>
      </div>
    </div>
  `,
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      poids: [
        '',
        [
          Validators.required,
          Validators.min(30),
          Validators.max(300)
        ]
      ],
      taille: [
        '',
        [
          Validators.required,
          Validators.min(100),
          Validators.max(250)
        ]
      ],
      age: [
        '',
        [
          Validators.required,
          Validators.min(13),
          Validators.max(120)
        ]
      ]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: RegisterPayload = {
      username: this.registerForm.get('username')?.value,
      email: this.registerForm.get('email')?.value,
      password: this.registerForm.get('password')?.value,
      poids: parseFloat(this.registerForm.get('poids')?.value),
      taille: parseInt(this.registerForm.get('taille')?.value),
      age: parseInt(this.registerForm.get('age')?.value)
    };

    this.authService.register(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.successMessage = 'Inscription réussie!';
          setTimeout(() => {
            this.router.navigate(['/dashboard', user.username]);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Erreur d\'inscription';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
