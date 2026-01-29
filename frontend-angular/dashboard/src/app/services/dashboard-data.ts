import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  getDailyCalories(): Observable<DayCalories[]> {
    return of([
      { date: '2026-01-11', calories: 2200 },
      { date: '2026-01-12', calories: 2450 },
      { date: '2026-01-13', calories: 1800 },
      { date: '2026-01-14', calories: 2600 },
      { date: '2026-01-15', calories: 2100 },
      { date: '2026-01-16', calories: 2359 },
      { date: '2026-01-17', calories: 1900 },
    ]);
  }

  getCaloriesByMeal(): Observable<CaloriesByMeal[]> {
    return of([
      { meal: 'Dinner', calories: 63235 },
      { meal: 'Lunch', calories: 51716 },
      { meal: 'Snacks', calories: 49542 },
      { meal: 'Breakfast', calories: 24453 },
      { meal: 'Dessert', calories: 14637 },
      { meal: 'Drinks', calories: 6407 },
    ]);
  }

  getCaloriesByScore(): Observable<CaloriesByScore[]> {
    return of([
      { score: 'Unhealthy', calories: 100000 },
      { score: 'Neutral', calories: 65000 },
      { score: 'Healthy', calories: 50000 },
    ]);
  }

  getTopUnhealthyFoods(): Observable<UnhealthyFoodRow[]> {
    return of([
      { food: 'Potato Chips', occurrences: 30, calories: 6010, carbs: 755, fat: 301, protein: 66, sodium: 6839, sugar: 57 },
      { food: 'Cookies', occurrences: 23, calories: 3265, carbs: 524, fat: 117, protein: 38, sodium: 2315, sugar: 339 },
      { food: 'Swiss Cheese', occurrences: 20, calories: 2200, carbs: 20, fat: 160, protein: 180, sodium: 1200, sugar: 0 },
      { food: 'Cheddar Cheese', occurrences: 20, calories: 2370, carbs: 1, fat: 196, protein: 155, sodium: 3880, sugar: 0 },
      { food: 'Red Wine', occurrences: 18, calories: 2703, carbs: 68, fat: 0, protein: 5, sodium: 19, sugar: 96 },
      { food: 'Ketchup', occurrences: 18, calories: 480, carbs: 120, fat: 0, protein: 4, sodium: 3840, sugar: 96 },
    ]);
  }

  getMealRelationship(): Observable<MealRelationshipPoint[]> {
    return of([
      { meal: 'Breakfast', calories: 24453, carbs: 2200 },
      { meal: 'Lunch', calories: 51716, carbs: 4500 },
      { meal: 'Snacks', calories: 49542, carbs: 3800 },
      { meal: 'Dinner', calories: 63235, carbs: 6500 },
    ]);
  }
}
