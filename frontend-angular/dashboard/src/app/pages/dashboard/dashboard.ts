import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'; // Added this import

import { CaloriesLineChartComponent } from '../../components/calories-line-chart/calories-line-chart';
import { CaloriesByMealChartComponent } from '../../components/calories-by-meal-chart/calories-by-meal-chart';
import { FoodScoreChartComponent } from '../../components/food-score-chart/food-score-chart';
import { MealsTableComponent } from '../../components/meals-table/meals-table';
import { MealRelationshipChartComponent } from '../../components/meal-relationship-chart/meal-relationship-chart';
import { ProgressRingComponent } from '../../components/progress-ring/progress-ring';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

import {
  DashboardDataService,
  DayCalories,
  CaloriesByMeal,
  CaloriesByScore,
  UnhealthyFoodRow,
  MealRelationshipPoint,
} from '../../services/dashboard-data';
import { UserService, UserData } from '../../services/user.service';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule,
    CaloriesLineChartComponent, CaloriesByMealChartComponent,
    FoodScoreChartComponent, MealRelationshipChartComponent,
    MealsTableComponent, ProgressRingComponent, SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  daily: DayCalories[] = [];
  caloriesByMeal: CaloriesByMeal[] = [];
  caloriesByScore: CaloriesByScore[] = [];
  mealRelationship: MealRelationshipPoint[] = [];
  topUnhealthyFoods: UnhealthyFoodRow[] = [];

  user: UserData | null = null;
  routeUsername: string | null = null;
  isLoading = true;
  errors: string[] = [];
  hasHistory = false;

  // Messages créatifs pour les nouveaux utilisateurs
  welcomeMessages = [
    "Bienvenue dans votre nouvelle vie saine! 🌟",
    "Prêt à transformer vos habitudes alimentaires? 💪",
    "Commencez votre voyage nutritionnel dès aujourd'hui! 🚀",
    "Votre future version saine vous attend! 🎯",
    "Chaque petit pas compte! 👣",
  ];
  welcomeMessage = '';

  constructor(
    private dashboardDataService: DashboardDataService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Récupérer le username du route parameter
    this.route.params.subscribe(params => {
      this.routeUsername = params['username'];
      this.loadAllData();
    });
  }

  loadAllData(): void {
    this.isLoading = true;
    this.errors = [];

    // Charger les données utilisateur
    this.user = this.userService.getUserFromStorage();

    // Sélectionner un message aléatoire
    const randomIndex = Math.floor(Math.random() * this.welcomeMessages.length);
    this.welcomeMessage = this.welcomeMessages[randomIndex];

    // Récupérer l'email de l'utilisateur
    const userEmail = this.userService.getUserEmail();
    if (!userEmail) {
      this.addError('Email utilisateur non trouvé');
      this.isLoading = false;
      return;
    }

    // Charger les données du dashboard en un seul appel consolidé
    const dataSubscription = this.dashboardDataService.getFullDashboardData(userEmail).subscribe({
      next: (response: any) => {
        try {
          console.log('Dashboard Data Received:', response);
          let data = response;

          // Handle double-encoded JSON or string response
          if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { console.error('JSON Parse Error', e); }
          }

          // Helper to ensure we always have arrays
          const toArray = (val: any) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'object') return Object.values(val);
            return [];
          };

          this.daily = toArray(data.daily);
          this.caloriesByMeal = toArray(data.caloriesByMeal);
          this.caloriesByScore = toArray(data.caloriesByScore);
          this.mealRelationship = toArray(data.mealRelationship);
          this.topUnhealthyFoods = toArray(data.topUnhealthyFoods);

          this.checkHistory();
        } catch (e) {
          console.error('Error processing dashboard data', e);
          this.addError('Erreur de traitement des données');
        } finally {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('API Error', err);
        this.addError('Erreur lors du chargement des données (' + (err.status || 'Network') + ')');
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });

    // Safety timeout: stop loading after 8 seconds
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        if (!this.daily.length) {
          this.addError('Le chargement prend trop de temps. Veuillez réessayer.');
        }
      }
    }, 8000);
  }

  checkHistory(): void {
    // Vérifier si l'utilisateur a des données historiques
    // Si tous les jours ont 0 calories ou très peu, c'est un nouvel utilisateur
    if (!this.daily || !Array.isArray(this.daily) || this.daily.length === 0) {
      this.hasHistory = false;
      return;
    }
    const totalCalories = this.daily.reduce((sum, day) => sum + (day.calories || 0), 0);
    this.hasHistory = totalCalories > 0;

    // Explicit debug log
    console.log('History Check:', { totalCalories, hasHistory: this.hasHistory });
  }

  addError(error: string): void {
    if (!this.errors.includes(error)) {
      this.errors.push(error);
    }
  }

  getUserInitials(): string {
    if (this.user && this.user.username) {
      return this.user.username
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (this.user && this.user.email) {
      return this.user.email[0].toUpperCase();
    }
    return 'U';
  }

  getUserDisplayName(): string {
    if (this.user && this.user.username) {
      return this.user.username;
    }
    if (this.user && this.user.email) {
      return this.user.email.split('@')[0];
    }
    return 'Utilisateur';
  }
}
