import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export type DayCalories = { date: string; calories: number };

export type CaloriesByMeal = { meal: string; calories: number };

export type CaloriesByScore = {
  score: 'Unhealthy' | 'Neutral' | 'Healthy';
  calories: number;
};

export type UnhealthyFoodRow = {
  food: string;
  occurrences: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
};

export type MealRelationshipPoint = {
  meal: string;
  calories: number;
  carbs: number;
};

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getDailyCalories(email: string): Observable<DayCalories[]> {
    return this.http
      .get<DayCalories[]>(`${this.apiUrl}/dashboard/daily-calories/${email}`)
      .pipe(catchError(this.handleError));
  }

  getCaloriesByMeal(email: string): Observable<CaloriesByMeal[]> {
    return this.http
      .get<CaloriesByMeal[]>(`${this.apiUrl}/dashboard/calories-by-meal/${email}`)
      .pipe(catchError(this.handleError));
  }

  getCaloriesByScore(email: string): Observable<CaloriesByScore[]> {
    return this.http
      .get<CaloriesByScore[]>(`${this.apiUrl}/dashboard/calories-by-score/${email}`)
      .pipe(catchError(this.handleError));
  }

  getTopUnhealthyFoods(email: string): Observable<UnhealthyFoodRow[]> {
    return this.http
      .get<UnhealthyFoodRow[]>(`${this.apiUrl}/dashboard/top-unhealthy-foods/${email}`)
      .pipe(catchError(this.handleError));
  }

  getMealRelationship(email: string): Observable<MealRelationshipPoint[]> {
    return this.http
      .get<MealRelationshipPoint[]>(`${this.apiUrl}/dashboard/meal-relationship/${email}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('Dashboard API error:', error);
    return throwError(() => new Error('Failed to fetch dashboard data'));
  }
}
