import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { CaloriesLineChartComponent } from '../../components/calories-line-chart/calories-line-chart';
import { CaloriesByMealChartComponent } from '../../components/calories-by-meal-chart/calories-by-meal-chart';
import { FoodScoreChartComponent } from '../../components/food-score-chart/food-score-chart';
import { MealsTableComponent } from '../../components/meals-table/meals-table';
import { MealRelationshipChartComponent } from '../../components/meal-relationship-chart/meal-relationship-chart';
import { ProgressRingComponent } from '../../components/progress-ring/progress-ring';

import {
  DashboardDataService,
  DayCalories,
  CaloriesByMeal,
  CaloriesByScore,
  UnhealthyFoodRow,
  MealRelationshipPoint,
} from '../../services/dashboard-data';
import { UserService, UserData } from '../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CaloriesLineChartComponent,
    CaloriesByMealChartComponent,
    FoodScoreChartComponent,
    MealRelationshipChartComponent,
    MealsTableComponent,
    ProgressRingComponent,
  ],
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
  ) {}

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

    // Charger les données du dashboard spécifiques à cet utilisateur
    this.dashboardDataService.getDailyCalories(userEmail).subscribe({
      next: (d) => {
        this.daily = d;
        this.checkHistory();
      },
      error: (err) => this.addError('Erreur lors du chargement des calories quotidiennes'),
      complete: () => (this.isLoading = false),
    });

    this.dashboardDataService.getCaloriesByMeal(userEmail).subscribe({
      next: (d) => (this.caloriesByMeal = d),
      error: (err) => this.addError('Erreur lors du chargement des calories par repas'),
    });

    this.dashboardDataService.getCaloriesByScore(userEmail).subscribe({
      next: (d) => (this.caloriesByScore = d),
      error: (err) => this.addError('Erreur lors du chargement des calories par score'),
    });

    this.dashboardDataService.getMealRelationship(userEmail).subscribe({
      next: (d) => (this.mealRelationship = d),
      error: (err) => this.addError('Erreur lors du chargement des relations de repas'),
    });

    this.dashboardDataService.getTopUnhealthyFoods(userEmail).subscribe({
      next: (d) => (this.topUnhealthyFoods = d),
      error: (err) => this.addError('Erreur lors du chargement des aliments malsains'),
    });
  }

  checkHistory(): void {
    // Vérifier si l'utilisateur a des données historiques
    // Si tous les jours ont 0 calories ou très peu, c'est un nouvel utilisateur
    const totalCalories = this.daily.reduce((sum, day) => sum + day.calories, 0);
    this.hasHistory = totalCalories > 0;
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
