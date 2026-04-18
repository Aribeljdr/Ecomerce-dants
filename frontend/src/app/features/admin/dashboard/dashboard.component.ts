import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AdminStats } from '../../../core/models/admin.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dash-wrap">
      <div class="dash-container">

        <!-- Header -->
        <div class="dash-header">
          <div>
            <p class="dash-greeting">{{ greeting() }},
              <strong>{{ auth.user()?.name }}</strong>
            </p>
            <h1 class="dash-title">Dashboard</h1>
          </div>
          <button class="btn btn--secondary btn--sm" (click)="loadStats()" [disabled]="loading()" title="Actualizar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" [style.animation]="loading() ? 'spin 1s linear infinite' : 'none'">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Actualizar
          </button>
        </div>

        @if (loading()) {
          <!-- Skeleton -->
          <div class="stat-grid">
            @for (n of [1,2,3,4]; track n) {
              <div class="stat-skeleton shimmer"></div>
            }
          </div>
          <div class="lower-grid">
            <div class="skeleton-block shimmer"></div>
            <div class="skeleton-block shimmer"></div>
            <div class="skeleton-block shimmer"></div>
          </div>

        } @else if (error()) {
          <div class="dash-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>No se pudieron cargar las estadísticas. Verificá que el servidor esté activo.</span>
            <button class="btn btn--secondary btn--sm" (click)="loadStats()">Reintentar</button>
          </div>

        } @else if (stats()) {
          <!-- ── Stat cards ── -->
          <div class="stat-grid">

            <div class="stat-card">
              <div class="stat-card__top">
                <span class="stat-card__label">Productos activos</span>
                <div class="stat-card__icon stat-card__icon--blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                </div>
              </div>
              <p class="stat-card__val">{{ stats()!.products.active }}</p>
              <p class="stat-card__sub">de {{ stats()!.products.total }} en total</p>
            </div>

            <div class="stat-card">
              <div class="stat-card__top">
                <span class="stat-card__label">Pedidos totales</span>
                <div class="stat-card__icon stat-card__icon--green">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
              </div>
              <p class="stat-card__val">{{ stats()!.orders.total }}</p>
              <p class="stat-card__sub">{{ stats()!.users.total }} usuarios registrados</p>
            </div>

            <div class="stat-card">
              <div class="stat-card__top">
                <span class="stat-card__label">Ingresos totales</span>
                <div class="stat-card__icon stat-card__icon--purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
              </div>
              <p class="stat-card__val">\${{ stats()!.orders.revenue | number:'1.0-0' }}</p>
              <p class="stat-card__sub">acumulado histórico</p>
            </div>

            <div class="stat-card" [class.stat-card--alert]="stats()!.orders.pending > 0">
              <div class="stat-card__top">
                <span class="stat-card__label">Pendientes</span>
                <div class="stat-card__icon stat-card__icon--orange">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                </div>
              </div>
              <p class="stat-card__val">{{ stats()!.orders.pending }}</p>
              <p class="stat-card__sub">
                @if (stats()!.orders.pending > 0) { requieren atención } @else { al día }
              </p>
            </div>

          </div>

          <!-- ── Lower grid ── -->
          <div class="lower-grid">

            <!-- Pedidos por estado -->
            <div class="dash-card">
              <h3 class="dash-card__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                Pedidos por estado
              </h3>
              <div class="status-list">
                @for (entry of statusEntries(); track entry.key) {
                  <div class="status-item">
                    <span class="order-status order-status--{{ entry.key }}">{{ statusLabel(entry.key) }}</span>
                    <div class="status-item__right">
                      <div class="status-bar">
                        <div class="status-bar__fill" [style.width.%]="barWidth(entry.count)"></div>
                      </div>
                      <span class="status-item__count">{{ entry.count }}</span>
                    </div>
                  </div>
                }
                @if (statusEntries().length === 0) {
                  <p class="empty-hint">Sin pedidos aún</p>
                }
              </div>
            </div>

            <!-- Inventario -->
            <div class="dash-card">
              <h3 class="dash-card__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                Inventario
              </h3>
              <div class="summary-list">
                <div class="summary-item">
                  <span class="summary-item__label">Productos activos</span>
                  <span class="summary-item__val">{{ stats()!.products.active }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-item__label">Inactivos</span>
                  <span class="summary-item__val">{{ stats()!.products.total - stats()!.products.active }}</span>
                </div>
                <div class="summary-item summary-item--divider"></div>
                <div class="summary-item">
                  <span class="summary-item__label">Stock bajo (≤ 5 ud.)</span>
                  <span class="summary-item__val" [class.summary-item__val--warn]="stats()!.products.lowStock > 0">
                    {{ stats()!.products.lowStock }}
                    @if (stats()!.products.lowStock > 0) { ⚠️ }
                  </span>
                </div>
              </div>
            </div>

            <!-- Acceso rápido -->
            <div class="dash-card">
              <h3 class="dash-card__title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Acceso rápido
              </h3>
              <div class="action-list">
                <a routerLink="/admin/products" class="action-item">
                  <div class="action-item__icon" style="background:#EFF6FF;color:#2563EB">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                  <span>Agregar producto</span>
                  <svg class="action-item__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
                </a>
                <a routerLink="/admin/orders" class="action-item">
                  <div class="action-item__icon" style="background:#F0FDF4;color:#16A34A">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                  <span>Ver pedidos</span>
                  <svg class="action-item__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
                </a>
                <a routerLink="/admin/categories" class="action-item">
                  <div class="action-item__icon" style="background:#F5F3FF;color:#7C3AED">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <span>Categorías</span>
                  <svg class="action-item__chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
                </a>
              </div>
            </div>

          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    /* ── Outer wrap: centers content inside the admin-content area ── */
    .dash-wrap {
      min-height: 100%;
      display: flex;
      justify-content: center;
      padding: var(--space-4) var(--space-4) var(--space-8);
    }

    .dash-container {
      width: 100%;
      max-width: 900px;
    }

    /* ── Header ── */
    .dash-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
    }

    .dash-greeting {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: 4px;
      strong { color: var(--color-text-primary); }
    }

    .dash-title {
      font-size: clamp(22px, 3vw, 30px);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.03em;
      line-height: 1;
    }

    /* ── Skeleton ── */
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .stat-skeleton {
      height: 110px;
      border-radius: var(--radius-xl);
    }

    .lower-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
    }

    .skeleton-block {
      height: 200px;
      border-radius: var(--radius-xl);
    }

    /* ── Stat cards ── */
    .stat-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: box-shadow var(--transition-fast);
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); }
      &--alert { background: #FFF7ED; }
    }

    .stat-card__top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .stat-card__label {
      font-size: 12px;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
    }

    .stat-card__icon {
      width: 30px; height: 30px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .stat-card__icon--blue   { background: #EFF6FF; color: #2563EB; }
    .stat-card__icon--green  { background: #F0FDF4; color: #16A34A; }
    .stat-card__icon--purple { background: #F5F3FF; color: #7C3AED; }
    .stat-card__icon--orange { background: #FFF7ED; color: #EA580C; }

    .stat-card__val {
      font-size: 32px;
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.03em;
      line-height: 1;
      color: var(--color-text-primary);
    }

    .stat-card__sub {
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    /* ── Lower cards ── */
    .dash-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-3);
    }

    .dash-card__title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
      svg { color: var(--color-text-secondary); flex-shrink: 0; }
    }

    /* ── Status list ── */
    .status-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .status-item__right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      justify-content: flex-end;
    }

    .status-bar {
      width: 60px; height: 4px;
      background: var(--color-border);
      border-radius: 2px;
      overflow: hidden;
    }

    .status-bar__fill {
      height: 100%;
      background: var(--color-text-secondary);
      border-radius: 2px;
      transition: width 600ms ease;
    }

    .status-item__count {
      font-size: 13px;
      font-weight: var(--font-weight-semibold);
      min-width: 20px;
      text-align: right;
    }

    .order-status {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: .05em;
      white-space: nowrap;
    }

    .order-status--pending    { background: #FFF3CD; color: #856404; }
    .order-status--confirmed  { background: #D1ECF1; color: #0C5460; }
    .order-status--processing { background: #D1ECF1; color: #0C5460; }
    .order-status--shipped    { background: #CCE5FF; color: #004085; }
    .order-status--delivered  { background: #D4EDDA; color: #155724; }
    .order-status--cancelled  { background: #F8D7DA; color: #721C24; }

    /* ── Summary list ── */
    .summary-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      &--divider { height: 1px; background: var(--color-border); padding: 0; }
    }

    .summary-item__label { color: var(--color-text-secondary); }

    .summary-item__val {
      font-weight: var(--font-weight-semibold);
      &--warn { color: #EA580C; }
    }

    /* ── Action list ── */
    .action-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      text-decoration: none;
      transition: background var(--transition-fast);
      &:hover { background: rgba(0,0,0,.04); }
      span { flex: 1; }
    }

    .action-item__icon {
      width: 28px; height: 28px;
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .action-item__chevron { opacity: .3; flex-shrink: 0; }
    .action-item:hover .action-item__chevron { opacity: .7; }

    /* ── Error ── */
    .dash-error {
      background: #FFF5F5;
      border: 1px solid #FED7D7;
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      color: var(--color-error);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 13px;
    }

    .empty-hint {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); }
      .lower-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  adminSvc = inject(AdminService);
  auth     = inject(AuthService);

  stats   = signal<AdminStats | null>(null);
  loading = signal(true);
  error   = signal(false);

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  statusEntries() {
    const s = this.stats();
    if (!s) return [];
    return Object.entries(s.orders.byStatus).map(([key, count]) => ({ key, count }));
  }

  statusLabel(key: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente', confirmed: 'Confirmado', processing: 'En proceso',
      shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado'
    };
    return map[key] ?? key;
  }

  barWidth(count: number): number {
    const total = this.stats()?.orders.total || 1;
    return Math.round((count / total) * 100);
  }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading.set(true);
    this.error.set(false);
    this.adminSvc.getStats().subscribe({
      next: res => { this.stats.set(res.stats); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }
}
