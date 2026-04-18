import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="oa-container">
      <!-- Header -->
      <div class="oa-header">
        <div>
          <h1 class="oa-title">Pedidos</h1>
          <p class="oa-sub">{{ total() }} pedidos en total</p>
        </div>
      </div>

      <!-- Status filter tabs -->
      <div class="oa-tabs">
        <button
          class="oa-tab"
          [class.oa-tab--active]="filterStatus() === ''"
          (click)="setStatus('')">
          Todos
        </button>
        @for (s of statuses; track s) {
          <button
            class="oa-tab"
            [class.oa-tab--active]="filterStatus() === s"
            (click)="setStatus(s)">
            {{ statusLabel(s) }}
          </button>
        }
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="oa-loading">
          @for (n of [1,2,3,4,5]; track n) {
            <div class="oa-row-skeleton shimmer"></div>
          }
        </div>
      } @else if (orders().length === 0) {
        <div class="oa-empty">
          <p>No hay pedidos con este estado.</p>
        </div>
      } @else {
        <div class="oa-table-wrap">
          <table class="oa-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order._id) {
                <tr class="oa-row" [class.oa-row--expanded]="expandedId() === order._id">
                  <td class="oa-cell oa-cell--id">#{{ order._id.slice(-6).toUpperCase() }}</td>
                  <td class="oa-cell">
                    <span class="oa-client">{{ getClientName(order) }}</span>
                    @if (getClientEmail(order)) {
                      <span class="oa-client-email">{{ getClientEmail(order) }}</span>
                    }
                  </td>
                  <td class="oa-cell">{{ order.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                  <td class="oa-cell">{{ order.items.length }} items</td>
                  <td class="oa-cell oa-cell--total">\${{ order.total | number:'1.0-0' }}</td>
                  <td class="oa-cell">
                    <span class="order-status order-status--{{ order.status }}">{{ statusLabel(order.status) }}</span>
                  </td>
                  <td class="oa-cell oa-cell--actions">
                    <button
                      class="action-btn action-btn--expand"
                      (click)="toggleExpand(order._id)"
                      [title]="expandedId() === order._id ? 'Cerrar' : 'Ver detalle'">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        @if (expandedId() === order._id) {
                          <polyline points="18,15 12,9 6,15"/>
                        } @else {
                          <polyline points="6,9 12,15 18,9"/>
                        }
                      </svg>
                    </button>
                    <select
                      class="status-select"
                      [ngModel]="order.status"
                      (ngModelChange)="changeStatus(order, $event)"
                      [disabled]="updatingId() === order._id">
                      @for (s of statuses; track s) {
                        <option [value]="s">{{ statusLabel(s) }}</option>
                      }
                    </select>
                  </td>
                </tr>

                <!-- Expanded row -->
                @if (expandedId() === order._id) {
                  <tr class="oa-detail-row">
                    <td colspan="7">
                      <div class="oa-detail">
                        <div class="oa-detail__section">
                          <h4 class="oa-detail__title">Items del pedido</h4>
                          <div class="oa-items">
                            @for (item of order.items; track item.product) {
                              <div class="oa-item">
                                @if (item.image) {
                                  <img [src]="item.image" [alt]="item.name" class="oa-item__img" />
                                } @else {
                                  <div class="oa-item__img oa-item__img--placeholder">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                                      <circle cx="8.5" cy="8.5" r="1.5"/>
                                      <polyline points="21,15 16,10 5,21"/>
                                    </svg>
                                  </div>
                                }
                                <div class="oa-item__info">
                                  <span class="oa-item__name">{{ item.name }}</span>
                                  <span class="oa-item__meta">x{{ item.quantity }} · \${{ item.price | number:'1.0-0' }} c/u</span>
                                </div>
                                <span class="oa-item__subtotal">\${{ item.price * item.quantity | number:'1.0-0' }}</span>
                              </div>
                            }
                          </div>
                          <div class="oa-totals">
                            <div class="oa-total-row">
                              <span>Subtotal</span><span>\${{ order.subtotal | number:'1.0-0' }}</span>
                            </div>
                            <div class="oa-total-row">
                              <span>Envío</span>
                              <span>{{ order.shippingCost === 0 ? 'Gratis' : '$' + (order.shippingCost | number:'1.0-0') }}</span>
                            </div>
                            <div class="oa-total-row oa-total-row--total">
                              <span>Total</span><span>\${{ order.total | number:'1.0-0' }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="oa-detail__section">
                          <h4 class="oa-detail__title">Datos de envío</h4>
                          <div class="oa-shipping">
                            <p class="oa-shipping__name">{{ order.shipping.name }}</p>
                            <p>{{ order.shipping.address }}</p>
                            <p>{{ order.shipping.city }}, {{ order.shipping.zip }}</p>
                            <p>{{ order.shipping.country }}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (pages() > 1) {
          <div class="oa-pagination">
            <button class="btn btn--secondary btn--sm" [disabled]="currentPage() <= 1" (click)="goPage(currentPage() - 1)">
              ← Anterior
            </button>
            <span class="oa-pagination__info">Página {{ currentPage() }} de {{ pages() }}</span>
            <button class="btn btn--secondary btn--sm" [disabled]="currentPage() >= pages()" (click)="goPage(currentPage() + 1)">
              Siguiente →
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .oa-container {
      padding: var(--space-4) var(--space-4) var(--space-8);
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .oa-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }

    .oa-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .oa-sub {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .oa-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-bottom: var(--space-3);
      background: var(--color-surface);
      padding: 4px;
      border-radius: var(--radius-lg);
      width: fit-content;
    }

    .oa-tab {
      padding: 6px 12px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
      border: none;
      background: transparent;
      cursor: pointer;
      transition: background 150ms ease, color 150ms ease;
    }

    .oa-tab:hover {
      background: #fff;
      color: var(--color-text-primary);
    }

    .oa-tab--active {
      background: #fff;
      color: var(--color-text-primary);
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .oa-loading {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .oa-row-skeleton {
      height: 52px;
      border-radius: var(--radius-md);
      background: #e5e7eb;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .oa-empty {
      text-align: center;
      padding: var(--space-6);
      color: var(--color-text-secondary);
      font-size: 14px;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
    }

    .oa-table-wrap {
      overflow-x: auto;
      border-radius: var(--radius-xl);
      background: var(--color-surface);
    }

    .oa-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .oa-table thead tr {
      border-bottom: 1px solid var(--color-border);
    }

    .oa-table th {
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      text-align: left;
    }

    .oa-row {
      border-bottom: 1px solid var(--color-border);
      transition: background 150ms ease;
    }

    .oa-row:hover {
      background: rgba(0,0,0,0.015);
    }

    .oa-row--expanded {
      background: rgba(0,0,0,0.02);
    }

    .oa-detail-row td {
      padding: 0;
      border-bottom: 1px solid var(--color-border);
    }

    .oa-cell {
      padding: 10px 14px;
      color: var(--color-text-secondary);
    }

    .oa-cell--id {
      font-family: monospace;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .oa-cell--total {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .oa-cell--actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .oa-client {
      display: block;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .oa-client-email {
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    .order-status {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .order-status--pending    { background: #FFF3CD; color: #856404; }
    .order-status--confirmed  { background: #D1ECF1; color: #0C5460; }
    .order-status--processing { background: #D1ECF1; color: #0C5460; }
    .order-status--shipped    { background: #CCE5FF; color: #004085; }
    .order-status--delivered  { background: #D4EDDA; color: #155724; }
    .order-status--cancelled  { background: #F8D7DA; color: #721C24; }

    .action-btn {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 150ms ease;
    }

    .action-btn--expand {
      background: var(--color-surface);
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }

    .action-btn--expand:hover {
      background: var(--color-border);
    }

    .status-select {
      font-size: 12px;
      padding: 4px 8px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: #fff;
      cursor: pointer;
      color: var(--color-text-primary);
      font-family: inherit;
    }

    .status-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Expanded detail */
    .oa-detail {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: #FAFAFA;
    }

    .oa-detail__title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }

    .oa-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .oa-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .oa-item__img {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      background: #f0f0f0;
      flex-shrink: 0;
    }

    .oa-item__img--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }

    .oa-item__info {
      flex: 1;
      min-width: 0;
    }

    .oa-item__name {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .oa-item__meta {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .oa-item__subtotal {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .oa-totals {
      margin-top: var(--space-2);
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .oa-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .oa-total-row--total {
      font-weight: 700;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .oa-shipping {
      font-size: 13px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .oa-shipping__name {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .oa-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }

    .oa-pagination__info {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .oa-detail { grid-template-columns: 1fr; }
      .oa-tabs { gap: 2px; }
    }
  `]
})
export class OrdersAdminComponent implements OnInit {
  private orderSvc = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  total = signal(0);
  pages = signal(1);
  currentPage = signal(1);
  filterStatus = signal('');
  expandedId = signal<string | null>(null);
  updatingId = signal<string | null>(null);

  readonly statuses = ORDER_STATUSES;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const filters: { status?: string; page?: number; limit?: number } = {
      page: this.currentPage(),
      limit: 20
    };
    if (this.filterStatus()) filters['status'] = this.filterStatus();

    this.orderSvc.getAllOrders(filters).subscribe({
      next: res => {
        this.orders.set(res.orders);
        this.total.set(res.total);
        this.pages.set(res.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setStatus(s: string) {
    this.filterStatus.set(s);
    this.currentPage.set(1);
    this.expandedId.set(null);
    this.load();
  }

  goPage(p: number) {
    this.currentPage.set(p);
    this.load();
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  changeStatus(order: Order, newStatus: string) {
    if (newStatus === order.status) return;
    this.updatingId.set(order._id);
    this.orderSvc.updateOrderStatus(order._id, newStatus).subscribe({
      next: res => {
        this.orders.update(list =>
          list.map(o => o._id === order._id ? { ...o, status: res.order.status } : o)
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null)
    });
  }

  getClientName(order: Order): string {
    const user = order.user as unknown as { name?: string } | string | undefined;
    if (user && typeof user === 'object' && user.name) return user.name;
    if (order.guestEmail) return 'Guest';
    return 'Usuario';
  }

  getClientEmail(order: Order): string {
    const user = order.user as unknown as { email?: string } | string | undefined;
    if (user && typeof user === 'object' && user.email) return user.email;
    return order.guestEmail || '';
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'En proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return map[s] || s;
  }
}
