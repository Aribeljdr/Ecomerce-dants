import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

interface TrackStep {
  key:   string;
  label: string;
  desc:  string;
  icon:  string;
  date?: string;
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="container od-container">

        <!-- Back -->
        <a routerLink="/orders" class="od-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15,18 9,12 15,6"/></svg>
          Mis pedidos
        </a>

        @if (loading()) {
          <div class="od-skeleton">
            <div class="shimmer od-skeleton__header"></div>
            <div class="shimmer od-skeleton__track"></div>
            <div class="shimmer od-skeleton__body"></div>
          </div>
        }

        @else if (order()) {
          <!-- Header del pedido -->
          <div class="od-header">
            <div class="od-header__left">
              <h1 class="od-header__id">Pedido #{{ order()!._id.slice(-8).toUpperCase() }}</h1>
              <p class="od-header__date text-secondary">{{ formatDate(order()!.createdAt) }}</p>
            </div>
            <span class="order-status" [class]="'order-status--' + order()!.status">
              {{ statusLabel(order()!.status) }}
            </span>
          </div>

          <!-- ══ TRACKER DE ENVÍO ══════════════════════════════════════════════ -->
          <div class="od-tracker">
            <div class="od-tracker__header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Seguimiento del envío
            </div>

            @if (order()!.status === 'cancelled') {
              <div class="od-cancelled">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <p>Este pedido fue cancelado</p>
              </div>
            } @else {
              <!-- Barra de progreso horizontal -->
              <div class="od-track">
                @for (step of trackSteps(); track step.key; let i = $index; let last = $last) {
                  <div class="od-track__step"
                       [class.od-track__step--done]="step.done"
                       [class.od-track__step--active]="step.active">

                    <div class="od-track__node">
                      @if (step.done) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                      } @else if (step.active) {
                        <div class="od-track__pulse"></div>
                      }
                    </div>

                    @if (!last) {
                      <div class="od-track__line" [class.od-track__line--done]="step.done"></div>
                    }

                    <div class="od-track__info">
                      <span class="od-track__icon">{{ step.icon }}</span>
                      <span class="od-track__label">{{ step.label }}</span>
                      @if (step.date) {
                        <span class="od-track__date">{{ step.date }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Mensaje de estado actual -->
              <div class="od-status-msg" [class]="'od-status-msg--' + order()!.status">
                <span class="od-status-msg__icon">{{ currentStepIcon() }}</span>
                <div>
                  <p class="od-status-msg__title">{{ currentStepTitle() }}</p>
                  <p class="od-status-msg__desc">{{ currentStepDesc() }}</p>
                </div>
              </div>
            }
          </div>

          <!-- ══ DETALLE DEL PEDIDO ═════════════════════════════════════════ -->
          <div class="od-body">

            <!-- Productos -->
            <div class="od-items">
              <h3 class="od-section-title">Productos pedidos</h3>
              @for (item of order()!.items; track item.product) {
                <div class="od-item">
                  <div class="od-item__img-wrap">
                    <img [src]="item.image" [alt]="item.name" class="od-item__img" />
                  </div>
                  <div class="od-item__info">
                    <p class="od-item__name">{{ item.name }}</p>
                    <p class="od-item__qty text-secondary">Cantidad: {{ item.quantity }}</p>
                  </div>
                  <div class="od-item__pricing">
                    <span class="price od-item__total">S/ {{ (item.price * item.quantity) | number:'1.0-0' }}</span>
                    <span class="text-secondary od-item__unit">S/ {{ item.price | number:'1.0-0' }} c/u</span>
                  </div>
                </div>
              }
            </div>

            <!-- Info lateral -->
            <div class="od-side">

              <!-- Envío a -->
              <div class="od-side-card">
                <h3 class="od-section-title">Dirección de entrega</h3>
                <div class="od-address">
                  <div class="od-address__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <p class="od-address__name">{{ order()!.shipping.name }}</p>
                    <p class="od-address__line">{{ order()!.shipping.address }}</p>
                    <p class="od-address__line">{{ order()!.shipping.city }}, {{ order()!.shipping.zip }}</p>
                    <p class="od-address__line">{{ order()!.shipping.country }}</p>
                  </div>
                </div>
              </div>

              <!-- Resumen de pago -->
              <div class="od-side-card">
                <h3 class="od-section-title">Resumen de pago</h3>
                <div class="od-summary">
                  <div class="od-summary__row">
                    <span class="text-secondary">Subtotal</span>
                    <span>S/ {{ order()!.subtotal | number:'1.0-0' }}</span>
                  </div>
                  <div class="od-summary__row">
                    <span class="text-secondary">Envío</span>
                    <span>{{ order()!.shippingCost === 0 ? 'Gratis' : 'S/ ' + order()!.shippingCost }}</span>
                  </div>
                  <div class="od-summary__divider"></div>
                  <div class="od-summary__row od-summary__row--total">
                    <span>Total pagado</span>
                    <span class="price">S/ {{ order()!.total | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        }

        @else {
          <div class="od-error">
            <p>No se encontró el pedido.</p>
            <a routerLink="/orders" class="btn btn--primary" style="margin-top:var(--space-3)">Ver mis pedidos</a>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .od-container { max-width: 860px; padding-top: var(--space-5); padding-bottom: var(--space-8); }

    .od-back {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--color-text-secondary);
      text-decoration: none; margin-bottom: var(--space-4);
      transition: color 150ms ease;
      &:hover { color: var(--color-text-primary); }
    }

    /* Header */
    .od-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: var(--space-3); margin-bottom: var(--space-4);
    }

    .od-header__id {
      font-size: clamp(20px, 2.5vw, 28px); font-weight: 800;
      letter-spacing: -0.02em; font-family: 'SF Mono','Fira Code',monospace;
    }

    .od-header__date { font-size: 13px; margin-top: 4px; }

    .order-status {
      display: inline-block; font-size: 12px; font-weight: 700;
      padding: 4px 12px; border-radius: 100px; text-transform: uppercase; letter-spacing: .05em;
      white-space: nowrap;
      &--pending    { background:#FFF3CD; color:#856404; }
      &--confirmed  { background:#D1ECF1; color:#0C5460; }
      &--processing { background:#D1ECF1; color:#0C5460; }
      &--shipped    { background:#CCE5FF; color:#004085; }
      &--delivered  { background:#D4EDDA; color:#155724; }
      &--cancelled  { background:#F8D7DA; color:#721C24; }
    }

    /* Skeleton */
    .od-skeleton { display: flex; flex-direction: column; gap: var(--space-3); }
    .od-skeleton__header { height: 60px; border-radius: var(--radius-lg); }
    .od-skeleton__track  { height: 160px; border-radius: var(--radius-xl); }
    .od-skeleton__body   { height: 300px; border-radius: var(--radius-xl); }

    /* ── Tracker ── */
    .od-tracker {
      background: var(--color-white); border: 1px solid var(--color-border);
      border-radius: var(--radius-xl); padding: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .od-tracker__header {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; color: var(--color-text-secondary);
      margin-bottom: var(--space-4);
    }

    /* Pasos del track */
    .od-track {
      display: flex; align-items: flex-start;
      gap: 0; margin-bottom: var(--space-3);
      overflow-x: auto; padding-bottom: 4px;
    }

    .od-track__step {
      display: flex; flex-direction: column; align-items: center;
      position: relative; flex: 1; min-width: 90px;
    }

    .od-track__node {
      width: 32px; height: 32px; border-radius: 50%;
      border: 2.5px solid var(--color-border);
      background: var(--color-white);
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 1; flex-shrink: 0;
      transition: all 250ms ease;

      .od-track__step--done & {
        background: var(--color-success); border-color: var(--color-success); color: #fff;
      }

      .od-track__step--active & {
        background: var(--color-black); border-color: var(--color-black);
        box-shadow: 0 0 0 4px rgba(0,0,0,.08);
      }
    }

    .od-track__pulse {
      width: 10px; height: 10px; border-radius: 50%; background: #fff;
      animation: pulse-ring 1.5s ease-in-out infinite;
    }

    @keyframes pulse-ring {
      0%   { transform: scale(.8); opacity: .6; }
      50%  { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(.8); opacity: .6; }
    }

    .od-track__line {
      position: absolute; top: 15px; left: 50%; width: 100%; height: 2.5px;
      background: var(--color-border); z-index: 0;
      transition: background 300ms ease;
      &--done { background: var(--color-success); }
    }

    .od-track__info {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      margin-top: 10px; text-align: center; padding: 0 4px;
    }

    .od-track__icon { font-size: 18px; }

    .od-track__label {
      font-size: 11px; font-weight: 600; color: var(--color-text-secondary);
      .od-track__step--active & { color: var(--color-text-primary); }
      .od-track__step--done &   { color: var(--color-success); }
    }

    .od-track__date {
      font-size: 10px; color: var(--color-text-secondary); opacity: .7;
    }

    /* Mensaje de estado */
    .od-status-msg {
      display: flex; align-items: center; gap: var(--space-2);
      padding: 14px var(--space-3); border-radius: var(--radius-lg);
      background: var(--color-surface);

      &--shipped, &--processing { background: #EFF6FF; }
      &--delivered { background: #F0FDF4; }
      &--pending, &--confirmed  { background: #FFFBEB; }
    }

    .od-status-msg__icon { font-size: 28px; flex-shrink: 0; }
    .od-status-msg__title { font-size: 15px; font-weight: 700; color: var(--color-text-primary); }
    .od-status-msg__desc  { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }

    .od-cancelled {
      display: flex; align-items: center; gap: var(--space-2);
      padding: var(--space-3); background: #FEF2F2; border-radius: var(--radius-lg);
      color: #DC2626; font-weight: 600;
    }

    /* Body */
    .od-body {
      display: grid; grid-template-columns: 1fr 280px; gap: var(--space-4); align-items: start;
      @media (max-width: 700px) { grid-template-columns: 1fr; }
    }

    .od-section-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .07em; color: var(--color-text-secondary); margin-bottom: var(--space-3);
    }

    /* Items */
    .od-items {
      background: var(--color-white); border: 1px solid var(--color-border);
      border-radius: var(--radius-xl); padding: var(--space-3);
    }

    .od-item {
      display: flex; align-items: center; gap: var(--space-2);
      padding: 12px 0; border-bottom: 1px solid var(--color-border);
      &:last-child { border-bottom: none; padding-bottom: 0; }
    }

    .od-item__img-wrap {
      width: 60px; height: 60px; background: var(--color-surface);
      border-radius: var(--radius-md); overflow: hidden; flex-shrink: 0;
    }

    .od-item__img { width: 100%; height: 100%; object-fit: contain; padding: 8px; }

    .od-item__info { flex: 1; }
    .od-item__name { font-size: 14px; font-weight: var(--font-weight-medium); line-height: 1.4; }
    .od-item__qty  { font-size: 12px; margin-top: 3px; }

    .od-item__pricing { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .od-item__total { font-size: 15px; }
    .od-item__unit  { font-size: 11px; }

    /* Side */
    .od-side { display: flex; flex-direction: column; gap: var(--space-3); }

    .od-side-card {
      background: var(--color-surface); border-radius: var(--radius-xl); padding: var(--space-3);
    }

    .od-address { display: flex; gap: var(--space-2); }

    .od-address__icon {
      width: 32px; height: 32px; background: var(--color-white);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: var(--color-text-secondary);
    }

    .od-address__name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
    .od-address__line { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }

    /* Summary */
    .od-summary { display: flex; flex-direction: column; gap: 2px; }
    .od-summary__row { display: flex; justify-content: space-between; font-size: 13px; padding: 5px 0; &--total { font-weight: 700; font-size: 15px; } }
    .od-summary__divider { height: 1px; background: var(--color-border); margin: 4px 0; }

    /* Error */
    .od-error { text-align: center; padding: var(--space-8); }
  `]
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route        = inject(ActivatedRoute);

  loading = signal(true);
  order   = signal<Order | null>(null);

  private readonly steps: TrackStep[] = [
    { key: 'pending',    label: 'Recibido',   desc: 'Tu pedido fue recibido y está siendo revisado.',         icon: '📋' },
    { key: 'confirmed',  label: 'Confirmado', desc: 'Pago confirmado, preparando tu pedido.',                  icon: '✅' },
    { key: 'processing', label: 'Almacén',    desc: 'Tu pedido está siendo empacado en nuestro almacén.',      icon: '📦' },
    { key: 'shipped',    label: 'En camino',  desc: 'Tu pedido está en tránsito con el courier.',             icon: '🚚' },
    { key: 'delivered',  label: 'Entregado',  desc: '¡Tu pedido fue entregado exitosamente!',                 icon: '🎉' },
  ];

  trackSteps() {
    const o = this.order();
    if (!o) return [];
    const currentIdx = this.steps.findIndex(s => s.key === o.status);
    return this.steps.map((s, i) => ({
      ...s,
      done:   i < currentIdx,
      active: i === currentIdx,
      date:   i <= currentIdx ? this.formatShortDate(o.createdAt) : undefined,
    }));
  }

  currentStepIcon() {
    const o = this.order();
    if (!o) return '';
    return this.steps.find(s => s.key === o.status)?.icon ?? '📋';
  }

  currentStepTitle() {
    const map: Record<string, string> = {
      pending:    'Pedido recibido — en revisión',
      confirmed:  'Pedido confirmado — preparando',
      processing: 'En nuestro almacén',
      shipped:    'En camino con el courier',
      delivered:  '¡Pedido entregado!',
    };
    return map[this.order()?.status ?? ''] ?? '';
  }

  currentStepDesc() {
    return this.steps.find(s => s.key === this.order()?.status)?.desc ?? '';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrderById(id).subscribe({
      next:  (res) => { this.order.set(res.order); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }

  statusLabel(status: Order['status']): string {
    const labels: Record<Order['status'], string> = {
      pending: 'Pendiente', confirmed: 'Confirmado', processing: 'Preparando',
      shipped: 'En camino', delivered: 'Entregado',  cancelled: 'Cancelado',
    };
    return labels[status] ?? status;
  }
}
