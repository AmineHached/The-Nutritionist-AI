import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { MealsComponent } from './pages/meals/meals';
import { ProfileComponent } from './pages/profile/profile';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', pathMatch: 'full', canActivate: [AuthGuard], component: DashboardComponent },
  { path: 'dashboard/:username', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'meals/:username', component: MealsComponent, canActivate: [AuthGuard] },
  { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];
