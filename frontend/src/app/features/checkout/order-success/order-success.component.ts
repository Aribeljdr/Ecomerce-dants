import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="container success-container">

        <div class="success-card">
          <div class="success-card__icon">✓</div>
          <h1 class="success-card__title">¡Pedido confirmado!</h1>
          <p class="success-card__subtitle text-secondary">
            Tu pedido #{{ orderId() | slice:0:8 }}... ha sido recibido y está siendo procesado.
          </p>

          @if (order()) {
            <div class="success-card__summary">
              <div class="success-summary__row">
                <span class="text-secondary">Total pagado</span>
                <span class="price">S/ {{ order()!.total | number:'1.0-0' }}</span>
              </div>
              <div class="success-summary__row">
                <span class="text-secondary">Envío a</span>
                <span style="font-size: 13px;">{{ order()!.shipping.city }}, {{ order()!.shipping.country }}</span>
              </div>
            </div>
          }

          <div class="success-card__actions">
            <a routerLink="/catalog" class="btn btn--primary btn--lg">Seguir comprando</a>
          </div>
        </div>

        <!-- Invitación a registrarse (solo aquí, nunca como barrera) -->
        @if (!auth.isLoggedIn()) {
          <div class="register-invite">
            <h3>¿Deseas guardar tu pedido?</h3>
            <p class="text-secondary">Crea una cuenta para acceder a tu historial de pedidos y agilizar futuras compras.</p>
            <a routerLink="/auth/register" class="btn btn--secondary">Crear cuenta gratis</a>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .success-container {
      max-width: 560px;
      padding-top: var(--space-8);
      padding-bottom: var(--space-8);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .success-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      text-align: center;
    }

    .success-card__icon {
      width: 64px;
      height: 64px;
      background: var(--color-success);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      margin: 0 auto var(--space-3);
    }

    .success-card__title {
      font-size: var(--font-size-h2);
      font-weight: var(--font-weight-bold);
      margin-bottom: var(--space-1);
    }

    .success-card__subtitle {
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-4);
    }

    .success-card__summary {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      margin-bottom: var(--space-4);
      text-align: left;
    }

    .success-summary__row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
      padding: 6px 0;
    }

    .success-card__actions {
      display: flex;
      gap: var(--space-2);
      justify-content: center;
    }

    .register-invite {
      background: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      align-items: center;

      h3 { font-size: 16px; font-weight: var(--font-weight-semibold); }
      p  { font-size: var(--font-size-sm); }
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  orderId = signal('');
  order = signal<Order | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderId.set(id);
    this.orderService.getOrderById(id).subscribe({
      next: (res) => this.order.set(res.order),
      error: () => {},
    });
  }
}
