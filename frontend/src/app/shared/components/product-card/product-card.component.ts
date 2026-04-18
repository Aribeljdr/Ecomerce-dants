import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article class="product-card" [routerLink]="['/product', product.slug]">
      <div class="product-card__image-wrap">
        <img
          [src]="product.images[0] || 'assets/placeholder.png'"
          [alt]="product.name"
          class="product-card__image"
          loading="lazy"
        />
        @if (product.compareAtPrice) {
          <span class="badge badge--sale product-card__badge">OFERTA</span>
        }
        @if (product.stock === 0) {
          <div class="product-card__out-of-stock">Sin stock</div>
        }
      </div>

      <div class="product-card__body">
        <span class="text-secondary product-card__brand">{{ product.brand }}</span>
        <h2 class="product-card__name">{{ product.name }}</h2>

        <ul class="product-card__specs">
          @for (spec of specsPreview; track spec[0]) {
            <li><span class="spec-key">{{ spec[0] }}</span> {{ spec[1] }}</li>
          }
        </ul>

        <div class="product-card__footer">
          <div class="product-card__pricing">
            <span class="price">S/ {{ product.price | number:'1.0-0' }}</span>
            @if (product.compareAtPrice) {
              <span class="price-compare">S/ {{ product.compareAtPrice | number:'1.0-0' }}</span>
            }
          </div>
          <button
            class="btn btn--secondary btn--sm"
            (click)="addToCart($event)"
            [disabled]="product.stock === 0"
          >
            + Carrito
          </button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .product-card {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: box-shadow var(--transition-fast);
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: var(--shadow-card-hover);

        .product-card__image {
          transform: scale(1.04);
        }
      }
    }

    .product-card__image-wrap {
      position: relative;
      background: var(--color-surface);
      overflow: hidden;
      aspect-ratio: 4/3;
    }

    .product-card__image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 16px;
      transition: transform var(--transition-fast);
    }

    .product-card__badge {
      position: absolute;
      top: 12px;
      left: 12px;
    }

    .product-card__out-of-stock {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-secondary);
      backdrop-filter: blur(2px);
    }

    .product-card__body {
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .product-card__brand {
      font-size: var(--font-size-label);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .product-card__name {
      font-size: 15px;
      font-weight: var(--font-weight-semibold);
      line-height: 1.3;
      color: var(--color-text-primary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-card__specs {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 4px;

      li {
        font-size: var(--font-size-label);
        color: var(--color-text-secondary);
      }

      .spec-key {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);
      }
    }

    .product-card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: var(--space-2);
    }

    .product-card__pricing {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private cart = inject(CartService);

  get specsPreview(): [string, string][] {
    const entries = Object.entries(this.product.specs ?? {});
    return entries.slice(0, 3) as [string, string][];
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cart.addItem(this.product);
  }
}
