import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('././pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
  },
  {
    path: 'detalle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/detalle/detalle.page').then(m => m.DetallePage),
  },
  {
    path: 'nueva',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/nueva/nueva.page').then(m => m.NuevaPage),
  },
];