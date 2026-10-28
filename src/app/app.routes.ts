import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes) },
  { path: 'detalle/:id', loadComponent: () => import('./pages/detalle/detalle.page').then(m => m.DetallePage) },
  { path: 'nueva', loadComponent: () => import('./pages/nueva/nueva.page').then(m => m.NuevaPage) },
];