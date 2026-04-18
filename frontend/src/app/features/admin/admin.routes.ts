import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products-admin.component').then(m => m.ProductsAdminComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders-admin.component').then(m => m.OrdersAdminComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories-admin.component').then(m => m.CategoriesAdminComponent)
  },
];
