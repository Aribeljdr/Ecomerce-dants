import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="container orders-container">

        <!-- Header -->
        <div class="orders-header">
          <div>
            <h1 class="orders-header__title">Mis pedidos</h1>
            <p class="orders-header__subtitle text-secondary">
              Historial de compras de <strong>{{ auth.user()?.name }}</strong>
            </p>
          </div>
          <a routerLink="/catalog" class="btn btn--secondary">Seguir comprando</a>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="orders-skeleton">
            @for (n of [1,2,3]; track n) {
              <div class="order-skeleton shimmer"></div>
            }
          </div>
        }

        <!-- Error -->
        @else if (error()) {
          <div class="orders-empty">
            <div class="orders-empty__icon">⚠️</div>
            <h3>No se pudieron cargar los pedidos</h3>
            <p class="text-secondary">Verifica tu conexión e intenta de nuevo.</p>
            <button class="btn btn--primary" style="margin-top: var(--space-3);" (click)="load()">Reintentar</button>
          </div>
        }

        <!-- Sin pedidos -->
        @else if (orders().length === 0) {
          <div class="orders-empty">
            <div class="orders-empty__icon">📦</div>
            <h3>Todavía no tienes pedidos</h3>
            <p class="text-secondary">Cuando realices tu primera compra, aparecerá aquí con todos los detalles.</p>
            <a routerLink="/catalog" class="btn btn--primary" style="margin-top: var(--space-3);">
              Explorar catálogo
            </a>
          </div>
        }

        <!-- Lista de pedidos -->
        @else {
          <div class="orders-stats">
            <div class="orders-stat">
              <span class="orders-stat__val">{{ orders().length }}</span>
              <span class="orders-stat__label">Pedidos totales</span>
            </div>
            <div class="orders-stat">
              <span class="orders-stat__val">S/ {{ totalSpent() | number:'1.0-0' }}</span>
              <span class="orders-stat__label">Total invertido</span>
            </div>
            <div class="orders-stat">
              <span class="orders-stat__val">{{ deliveredCount() }}</span>
              <span class="orders-stat__label">Entregados</span>
            </div>
          </div>

          <div class="orders-list">
            @for (order of orders(); track order._id) {
              <div class="order-card" [class.order-card--expanded]="expandedId() === order._id">

                <!-- Cabecera del pedido -->
                <div class="order-card__header" (click)="toggleExpand(order._id)">
                  <div class="order-card__meta">
                    <div class="order-card__id">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                      <span class="order-card__id-text">#{{ order._id.slice(-8).toUpperCase() }}</span>
                    </div>
                    <span class="order-card__date text-secondary">{{ formatDate(order.createdAt) }}</span>
                  </div>

                  <div class="order-card__right">
                    <!-- Previsualización de imágenes -->
                    <div class="order-card__images">
                      @for (item of order.items.slice(0, 3); track item.product) {
                        <div class="order-card__img-wrap">
                          <img [src]="item.image" [alt]="item.name" class="order-card__img" />
                        </div>
                      }
                      @if (order.items.length > 3) {
                        <div class="order-card__img-more">+{{ order.items.length - 3 }}</div>
                      }
                    </div>

                    <div class="order-card__summary">
                      <span class="order-card__total price">S/ {{ order.total | number:'1.0-0' }}</span>
                      <span class="order-status" [class]="'order-status--' + order.status">
                        {{ statusLabel(order.status) }}
                      </span>
                    </div>

                    <svg class="order-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </div>
                </div>

                <!-- Detalle expandido -->
                @if (expandedId() === order._id) {
                  <div class="order-card__body">
                    <div class="order-detail-layout">

                      <!-- Items -->
                      <div class="order-items">
                        <p class="order-section-label">Productos</p>
                        @for (item of order.items; track item.product) {
                          <div class="order-item">
                            <div class="order-item__img-wrap">
                              <img [src]="item.image" [alt]="item.name" class="order-item__img" />
                            </div>
                            <div class="order-item__info">
                              <p class="order-item__name">{{ item.name }}</p>
                              <p class="order-item__qty text-secondary">Cantidad: {{ item.quantity }}</p>
                            </div>
                            <div class="order-item__price">
                              <span class="price">S/ {{ (item.price * item.quantity) | number:'1.0-0' }}</span>
                              <span class="text-secondary" style="font-size: 12px;">S/ {{ item.price | number:'1.0-0' }} c/u</span>
                            </div>
                          </div>
                        }
                      </div>

                      <!-- Info de envío y totales -->
                      <div class="order-side">
                        <div class="order-side__block">
                          <p class="order-section-label">Dirección de envío</p>
                          <p class="order-side__addr">{{ order.shipping.name }}</p>
                          <p class="order-side__addr text-secondary">{{ order.shipping.address }}</p>
                          <p class="order-side__addr text-secondary">{{ order.shipping.city }}, {{ order.shipping.country }}</p>
                        </div>

                        <div class="order-side__block">
                          <p class="order-section-label">Resumen</p>
                          <div class="order-side__row">
                            <span class="text-secondary">Subtotal</span>
                            <span>S/ {{ order.subtotal | number:'1.0-0' }}</span>
                          </div>
                          <div class="order-side__row">
                            <span class="text-secondary">Envío</span>
                            <span>{{ order.shippingCost === 0 ? 'Gratis' : 'S/ ' + order.shippingCost }}</span>
                          </div>
                          <div class="divider"></div>
                          <div class="order-side__row order-side__row--total">
                            <span>Total</span>
                            <span class="price">S/ {{ order.total | number:'1.0-0' }}</span>
                          </div>
                        </div>

                        <div class="order-side__block">
                          <p class="order-section-label">Estado del pedido</p>
                          <div class="order-timeline">
                            @for (step of getTimeline(order.status); track step.label) {
                              <div class="order-timeline__step" [class.done]="step.done" [class.active]="step.active">
                                <div class="order-timeline__dot"></div>
                                <span class="order-timeline__label">{{ step.label }}</span>
                              </div>
                            }
                          </div>
                        </div>

                        <button class="btn btn--primary btn--full" (click)="goToDetail(order._id, $event)">
                          Ver detalle del pedido →
                        </button>
                      </div>

                    </div>
                  </div>
                }

              </div>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      max-width: 860px;
      padding-top: var(--space-6);
      padding-bottom: var(--space-8);
    }

    /* ── Header ── */
    .orders-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .orders-header__title {
      font-size: clamp(24px, 3vw, 32px);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.02em;
    }

    .orders-header__subtitle {
      font-size: 14px;
      margin-top: 4px;
    }

    /* ── Stats ── */
    .orders-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-2);
      margin-bottom: var(--space-5);

      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }

    .orders-stat {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .orders-stat__val {
      font-size: 26px;
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.02em;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .orders-stat__label {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }

    /* ── Skeleton ── */
    .orders-skeleton {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .order-skeleton {
      height: 80px;
      border-radius: var(--radius-xl);
    }

    /* ── Empty / error ── */
    .orders-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-8) var(--space-4);
      gap: var(--space-2);

      &__icon { font-size: 56px; line-height: 1; }
      h3 { font-size: var(--font-size-h2); font-weight: var(--font-weight-semibold); }
    }

    /* ── Lista ── */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .order-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1.5px solid transparent;
      transition: border-color var(--transition-fast);

      &--expanded {
        border-color: var(--color-border);
      }
    }

    .order-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-3);
      cursor: pointer;
      gap: var(--space-2);
      transition: background var(--transition-fast);

      &:hover { background: rgba(0,0,0,0.02); }
    }

    .order-card__meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .order-card__id {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--color-text-secondary);
    }

    .order-card__id-text {
      font-size: 13px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .order-card__date {
      font-size: 12px;
    }

    .order-card__right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex: 1;
      justify-content: flex-end;
    }

    .order-card__images {
      display: flex;
      align-items: center;
    }

    .order-card__img-wrap {
      width: 40px;
      height: 40px;
      background: var(--color-white);
      border-radius: 8px;
      border: 2px solid var(--color-surface);
      overflow: hidden;
      margin-left: -8px;

      &:first-child { margin-left: 0; }
    }

    .order-card__img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 4px;
    }

    .order-card__img-more {
      width: 40px;
      height: 40px;
      background: var(--color-border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary);
      margin-left: -8px;
      border: 2px solid var(--color-surface);
    }

    .order-card__summary {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .order-card__total {
      font-size: 16px;
    }

    .order-card__chevron {
      opacity: 0.4;
      flex-shrink: 0;
      transition: transform 200ms ease;
    }

    .order-card--expanded .order-card__chevron {
      transform: rotate(180deg);
    }

    /* Status badge */
    .order-status {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &--pending    { background: #FFF3CD; color: #856404; }
      &--confirmed  { background: #D1ECF1; color: #0C5460; }
      &--processing { background: #D1ECF1; color: #0C5460; }
      &--shipped    { background: #CCE5FF; color: #004085; }
      &--delivered  { background: #D4EDDA; color: #155724; }
      &--cancelled  { background: #F8D7DA; color: #721C24; }
    }

    /* ── Body expandido ── */
    .order-card__body {
      border-top: 1px solid var(--color-border);
      padding: var(--space-3);
      background: var(--color-white);
      animation: slideDown 200ms ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .order-detail-layout {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: var(--space-4);

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .order-section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }

    /* Items */
    .order-items {
      display: flex;
      flex-direction: column;
    }

    .order-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);

      &:last-child { border-bottom: none; }
    }

    .order-item__img-wrap {
      width: 52px;
      height: 52px;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
      flex-shrink: 0;
    }

    .order-item__img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 6px;
    }

    .order-item__info { flex: 1; }

    .order-item__name {
      font-size: 13px;
      font-weight: var(--font-weight-medium);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .order-item__qty {
      font-size: 12px;
      margin-top: 2px;
    }

    .order-item__price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    /* Side */
    .order-side {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .order-side__block {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-2) var(--space-3);
    }

    .order-side__addr {
      font-size: 13px;
      line-height: 1.6;
    }

    .order-side__row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 4px 0;

      &--total {
        font-weight: var(--font-weight-semibold);
        font-size: 15px;
      }
    }

    .btn--full { width: 100%; margin-top: var(--space-2); }

    /* Timeline de estado */
    .order-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-top: 4px;
    }

    .order-timeline__step {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        left: 7px;
        top: 22px;
        width: 2px;
        height: calc(100% - 6px);
        background: var(--color-border);
      }

      &.done::after { background: var(--color-success); }
    }

    .order-timeline__dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      background: var(--color-white);
      flex-shrink: 0;
      z-index: 1;
      transition: all 200ms;

      .done & {
        background: var(--color-success);
        border-color: var(--color-success);
      }

      .active & {
        background: var(--color-black);
        border-color: var(--color-black);
        box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
      }
    }

    .order-timeline__label {
      font-size: 12px;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);

      .done & { color: var(--color-success); }
      .active & { color: var(--color-text-primary); font-weight: 600; }
    }
  `]
})
export class OrdersComponent implements OnInit {
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  loading = signal(true);
  error = signal(false);
  orders = signal<Order[]>([]);
  expandedId = signal<string | null>(null);

  totalSpent = () => this.orders().reduce((sum, o) => sum + o.total, 0);
  deliveredCount = () => this.orders().filter(o => o.status === 'delivered').length;

  private readonly statusSteps = [
    { key: 'pending',    label: 'Pedido recibido' },
    { key: 'confirmed',  label: 'Confirmado' },
    { key: 'processing', label: 'En preparación' },
    { key: 'shipped',    label: 'En camino' },
    { key: 'delivered',  label: 'Entregado' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(res.orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending:    'Pendiente',
      confirmed:  'Confirmado',
      processing: 'Preparando',
      shipped:    'En camino',
      delivered:  'Entregado',
      cancelled:  'Cancelado',
    };
    return labels[status] ?? status;
  }

  goToDetail(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/orders', id]);
  }

  getTimeline(currentStatus: Order['status']): { label: string; done: boolean; active: boolean }[] {
    if (currentStatus === 'cancelled') {
      return [{ label: 'Pedido cancelado', done: false, active: true }];
    }
    const currentIdx = this.statusSteps.findIndex(s => s.key === currentStatus);
    return this.statusSteps.map((step, i) => ({
      label: step.label,
      done: i < currentIdx,
      active: i === currentIdx,
    }));
  }
}
