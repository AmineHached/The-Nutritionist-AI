import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { MealsComponent } from './pages/meals/meals';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'meals', component: MealsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: 'dashboard' },
];
