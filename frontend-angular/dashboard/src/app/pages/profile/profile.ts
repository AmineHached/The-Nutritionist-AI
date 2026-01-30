import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserData } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  userData: UserData | null = null;
  isLoading = true;
  error: string | null = null;
  isEditing = false;
  bmi: number = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.error = null;

    // Essayer de récupérer les données depuis le localStorage d'abord
    this.userData = this.userService.getUserFromStorage();

    if (this.userData?.email) {
      // Si on a un email, chercher les données actualisées depuis l'API
      this.userService.getUserData(this.userData.email).subscribe({
        next: (data) => {
          this.userData = data;
          this.calculateBMI();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des données utilisateur:', err);
          // Garder les données du localStorage si l'API échoue
          this.calculateBMI();
          this.isLoading = false;
        },
      });
    } else {
      this.error = 'Aucune donnée utilisateur trouvée';
      this.isLoading = false;
    }
  }

  calculateBMI(): void {
    if (this.userData) {
      this.bmi = this.userService.calculateBMI(this.userData.poids, this.userData.taille);
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }

  saveProfile(): void {
    if (this.userData) {
      this.userService.updateUserProfile(this.userData).subscribe({
        next: (data) => {
          this.userData = data;
          this.calculateBMI();
          this.isEditing = false;
          localStorage.setItem('userData', JSON.stringify(data));
        },
        error: (err) => {
          console.error('Erreur lors de la sauvegarde du profil:', err);
          this.error = 'Erreur lors de la sauvegarde du profil';
        },
      });
    }
  }

  cancelEdit(): void {
    this.loadUserData();
    this.isEditing = false;
  }
}

