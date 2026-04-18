import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="container" style="max-width: 860px; padding-top: var(--space-6); padding-bottom: var(--space-8);">

        <h1 style="margin-bottom: var(--space-4);">Tu carrito</h1>

        @if (cart.items().length === 0) {
          <div class="cart-empty">
            <div class="cart-empty__icon">🛒</div>
            <h2>El carrito está vacío</h2>
            <p class="text-secondary">Agrega componentes para armar tu PC.</p>
            <a routerLink="/catalog" class="btn btn--primary" style="margin-top: var(--space-3);">Explorar catálogo</a>
          </div>
        } @else {
          <div class="cart-layout">

            <!-- Items -->
            <div class="cart-items">
              @for (item of cart.items(); track item.product._id) {
                <div class="cart-item">
                  <img [src]="item.product.images[0]" [alt]="item.product.name" class="cart-item__img" />

                  <div class="cart-item__info">
                    <p class="text-secondary cart-item__brand">{{ item.product.brand }}</p>
                    <p class="cart-item__name">{{ item.product.name }}</p>
                    <p class="price cart-item__price">S/ {{ item.product.price | number:'1.0-0' }}</p>
                  </div>

                  <div class="cart-item__qty">
                    <button class="qty-btn" (click)="cart.updateQuantity(item.product._id, item.quantity - 1)">−</button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button class="qty-btn" (click)="cart.updateQuantity(item.product._id, item.quantity + 1)">+</button>
                  </div>

                  <div class="cart-item__total">
                    <span class="price">S/ {{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
                  </div>

                  <button class="cart-item__remove btn btn--ghost" (click)="cart.removeItem(item.product._id)">✕</button>
                </div>
              }
            </div>

            <!-- Resumen -->
            <aside class="cart-summary">
              <h3 class="cart-summary__title">Resumen</h3>

              <div class="cart-summary__row">
                <span class="text-secondary">Subtotal</span>
                <span>S/ {{ cart.subtotal() | number:'1.0-0' }}</span>
              </div>
              <div class="cart-summary__row">
                <span class="text-secondary">Envío</span>
                <span>{{ cart.subtotal() >= 1000 ? 'Gratis' : 'S/ 15' }}</span>
              </div>

              <div class="divider"></div>

              <div class="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <span class="price">S/ {{ total() | number:'1.0-0' }}</span>
              </div>

              @if (cart.subtotal() < 1000) {
                <p class="cart-summary__free-shipping text-secondary">
                  Agrega S/ {{ 1000 - cart.subtotal() | number:'1.0-0' }} más para envío gratis.
                </p>
              }

              <a routerLink="/checkout" class="btn btn--primary btn--lg btn--full" style="margin-top: var(--space-3);">
                Proceder al checkout
              </a>
              <a routerLink="/catalog" class="btn btn--ghost" style="margin-top: var(--space-1); text-align: center; display: block;">
                ← Seguir comprando
              </a>
            </aside>

          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .cart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-8);
      text-align: center;
      gap: var(--space-2);

      &__icon { font-size: 56px; }
      h2 { font-size: var(--font-size-h2); }
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: var(--space-6);
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    // Items
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto 32px;
      gap: var(--space-2);
      align-items: center;
      padding: var(--space-2);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
    }

    .cart-item__img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      background: var(--color-white);
      border-radius: var(--radius-md);
      padding: 8px;
    }

    .cart-item__brand {
      font-size: var(--font-size-label);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .cart-item__name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      margin: 2px 0 6px;
    }

    .cart-item__price {
      font-size: 15px;
    }

    // Qty
    .cart-item__qty {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--color-white);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      padding: 2px;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition-fast);

      &:hover { background: var(--color-surface); }
    }

    .qty-value {
      min-width: 24px;
      text-align: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .cart-item__total {
      text-align: right;
    }

    .cart-item__remove {
      color: var(--color-text-secondary);
      font-size: 14px;
      padding: 4px;
      justify-self: center;
    }

    // Summary
    .cart-summary {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-3);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-3));
    }

    .cart-summary__title {
      font-size: 16px;
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--space-3);
    }

    .cart-summary__row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
      padding: 6px 0;

      &--total {
        font-size: 16px;
        font-weight: var(--font-weight-semibold);
      }
    }

    .cart-summary__free-shipping {
      font-size: var(--font-size-label);
      margin-top: var(--space-2);
      text-align: center;
    }
  `]
})
export class CartComponent {
  cart = inject(CartService);

  total(): number {
    const sub = this.cart.subtotal();
    return sub >= 1000 ? sub : sub + 15;
  }
}
