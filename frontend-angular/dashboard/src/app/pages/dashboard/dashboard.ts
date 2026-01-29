import { Component, OnInit } from '@angular/core';

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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
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

  constructor(private svc: DashboardDataService) {}

  ngOnInit(): void {
    this.svc.getDailyCalories().subscribe((d) => (this.daily = d));
    this.svc.getCaloriesByMeal().subscribe((d) => (this.caloriesByMeal = d));
    this.svc.getCaloriesByScore().subscribe((d) => (this.caloriesByScore = d));
    this.svc.getMealRelationship().subscribe((d) => (this.mealRelationship = d));
    this.svc.getTopUnhealthyFoods().subscribe((d) => (this.topUnhealthyFoods = d));
  }
}
