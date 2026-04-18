import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Panel Admin
        </div>
        <nav class="admin-nav">
          <a routerLink="/admin/dashboard" routerLinkActive="admin-nav__link--active" class="admin-nav__link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </a>
          <a routerLink="/admin/products" routerLinkActive="admin-nav__link--active" class="admin-nav__link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
            Productos
          </a>
          <a routerLink="/admin/orders" routerLinkActive="admin-nav__link--active" class="admin-nav__link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Pedidos
          </a>
          <a routerLink="/admin/categories" routerLinkActive="admin-nav__link--active" class="admin-nav__link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Categorías
          </a>
        </nav>
        <div class="admin-sidebar__footer">
          <a routerLink="/" class="admin-nav__link admin-nav__link--muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Ver tienda
          </a>
        </div>
      </aside>
      <!-- Content -->
      <main class="admin-content">
        <router-outlet/>
      </main>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      padding-top: var(--navbar-height);
    }

    .admin-sidebar {
      width: 220px;
      flex-shrink: 0;
      background: #fff;
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: var(--navbar-height);
      left: 0;
      bottom: 0;
      overflow-y: auto;
      z-index: 100;
    }

    .admin-sidebar__brand {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--space-3) var(--space-3) var(--space-2);
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-primary);
      letter-spacing: -0.01em;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: var(--space-1);
    }

    .admin-sidebar__brand svg {
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      padding: var(--space-1) var(--space-2);
      flex: 1;
    }

    .admin-nav__link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: background var(--transition-fast), color var(--transition-fast);
    }

    .admin-nav__link svg {
      flex-shrink: 0;
    }

    .admin-nav__link:hover {
      background: var(--color-surface);
      color: var(--color-text-primary);
    }

    .admin-nav__link--active {
      background: var(--color-surface);
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .admin-nav__link--active svg {
      color: var(--color-black);
    }

    .admin-nav__link--muted {
      color: var(--color-text-secondary);
      font-size: 12px;
    }

    .admin-sidebar__footer {
      padding: var(--space-2);
      border-top: 1px solid var(--color-border);
    }

    .admin-content {
      flex: 1;
      margin-left: 220px;
      min-height: calc(100vh - var(--navbar-height));
      background: var(--color-bg, #FAFAFA);
    }
  `]
})
export class AdminComponent {
  auth = inject(AuthService);
}
