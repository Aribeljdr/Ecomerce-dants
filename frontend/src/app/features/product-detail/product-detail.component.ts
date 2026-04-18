import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      @if (loading()) {
        <div class="container" style="padding-top: var(--space-6);">
          <div class="pd-skeleton">
            <div class="shimmer pd-skeleton__img"></div>
            <div class="pd-skeleton__info">
              <div class="shimmer" style="height: 14px; width: 80px; margin-bottom: 12px;"></div>
              <div class="shimmer" style="height: 32px; width: 90%; margin-bottom: 8px;"></div>
              <div class="shimmer" style="height: 32px; width: 70%; margin-bottom: 24px;"></div>
              <div class="shimmer" style="height: 24px; width: 100px; margin-bottom: 32px;"></div>
              <div class="shimmer" style="height: 52px; width: 100%;"></div>
            </div>
          </div>
        </div>
      } @else if (product()) {
        <div class="container pd-layout">

          <!-- Columna imagen -->
          <div class="pd-images">
            <div class="pd-images__main">
              <img [src]="activeImage()" [alt]="product()!.name" class="pd-images__img" />
            </div>
            @if (product()!.images.length > 1) {
              <div class="pd-images__thumbs">
                @for (img of product()!.images; track img) {
                  <button class="pd-images__thumb" [class.active]="activeImage() === img" (click)="activeImage.set(img)">
                    <img [src]="img" [alt]="product()!.name" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Columna info -->
          <div class="pd-info">
            <!-- Jerarquía visual inmutable (UX) -->
            <a [routerLink]="['/catalog', product()!.category.slug]" class="pd-info__breadcrumb text-secondary">
              ← {{ product()!.category.name }}
            </a>

            <p class="pd-info__brand text-secondary">{{ product()!.brand }}</p>
            <h1 class="pd-info__name">{{ product()!.name }}</h1>

            <!-- Rating -->
            <div class="pd-info__rating">
              <span class="pd-info__stars">{{ starsDisplay(product()!.rating) }}</span>
              <span class="text-secondary" style="font-size: 13px;">{{ product()!.reviewCount }} reseñas</span>
            </div>

            <!-- Specs rápidas (velocidad de decisión) -->
            <ul class="pd-specs">
              @for (spec of specsEntries; track spec[0]) {
                <li class="pd-specs__item">
                  <span class="pd-specs__key">{{ spec[0] }}</span>
                  <span class="pd-specs__val">{{ spec[1] }}</span>
                </li>
              }
            </ul>

            <!-- Precio (transparencia) -->
            <div class="pd-pricing">
              <span class="price pd-pricing__price">S/ {{ product()!.price | number:'1.0-0' }}</span>
              @if (product()!.compareAtPrice) {
                <span class="price-compare">S/ {{ product()!.compareAtPrice | number:'1.0-0' }}</span>
                <span class="badge badge--sale">{{ savings() }}% OFF</span>
              }
            </div>

            <!-- Stock -->
            @if (product()!.stock > 0) {
              <p class="pd-info__stock" style="color: var(--color-success); font-size: 13px; font-weight: 500;">
                ✓ En stock ({{ product()!.stock }} disponibles)
              </p>
            } @else {
              <p class="pd-info__stock" style="color: var(--color-error); font-size: 13px; font-weight: 500;">
                Sin stock
              </p>
            }

            <!-- CTAs (Ley de Fitts: botones grandes) -->
            <div class="pd-actions">
              <button class="btn btn--primary btn--lg btn--full"
                [disabled]="product()!.stock === 0"
                [routerLink]="['/checkout']"
                (click)="buyNow()">
                Comprar ahora
              </button>
              <button class="btn btn--secondary btn--lg btn--full"
                [disabled]="product()!.stock === 0"
                (click)="addToCart()">
                + Añadir al carrito
              </button>
            </div>

            <!-- Descripción -->
            @if (product()!.description) {
              <div class="pd-description">
                <h3>Descripción</h3>
                <p>{{ product()!.description }}</p>
              </div>
            }
          </div>

        </div>
      } @else {
        <div class="container" style="padding: var(--space-8); text-align: center;">
          <h2>Producto no encontrado</h2>
          <a routerLink="/catalog" class="btn btn--primary" style="margin-top: var(--space-3);">Volver al catálogo</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .pd-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
      padding-top: var(--space-6);
      padding-bottom: var(--space-8);
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: var(--space-4);
      }
    }

    // Imágenes
    .pd-images__main {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      overflow: hidden;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4);
    }

    .pd-images__img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .pd-images__thumbs {
      display: flex;
      gap: var(--space-1);
      margin-top: var(--space-2);
    }

    .pd-images__thumb {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
      background: var(--color-surface);
      padding: 4px;
      transition: border-color var(--transition-fast);

      img { width: 100%; height: 100%; object-fit: contain; }

      &.active { border-color: var(--color-black); }
    }

    // Info
    .pd-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-3));
    }

    .pd-info__breadcrumb {
      font-size: var(--font-size-sm);
      text-decoration: none;
      transition: color var(--transition-fast);
      &:hover { color: var(--color-text-primary); }
    }

    .pd-info__brand {
      font-size: var(--font-size-label);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: var(--font-weight-medium);
    }

    .pd-info__name {
      font-size: clamp(22px, 3vw, 30px);
      font-weight: var(--font-weight-bold);
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .pd-info__rating {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .pd-info__stars {
      color: #F5A623;
      font-size: 15px;
      letter-spacing: 2px;
    }

    // Specs
    .pd-specs {
      list-style: none;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .pd-specs__item {
      display: flex;
      justify-content: space-between;
      padding: 10px var(--space-2);
      font-size: var(--font-size-sm);
      border-bottom: 1px solid var(--color-border);

      &:last-child { border-bottom: none; }
    }

    .pd-specs__key {
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }

    .pd-specs__val {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }

    // Precio
    .pd-pricing {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .pd-pricing__price {
      font-size: 32px;
    }

    // Acciones
    .pd-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    // Descripción
    .pd-description {
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border);

      h3 {
        font-size: 15px;
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--space-1);
      }

      p {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        line-height: 1.7;
      }
    }

    // Skeleton
    .pd-skeleton {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
      padding-top: var(--space-6);
    }

    .pd-skeleton__img {
      aspect-ratio: 1;
      border-radius: var(--radius-xl);
    }

    .pd-skeleton__info {
      padding-top: var(--space-4);
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  product = signal<Product | null>(null);
  activeImage = signal<string>('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug')!;
      this.productService.getProductBySlug(slug).subscribe({
        next: (res) => {
          this.product.set(res.product);
          this.activeImage.set(res.product.images[0] ?? '');
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  get specsEntries(): [string, string][] {
    return Object.entries(this.product()?.specs ?? {}) as [string, string][];
  }

  starsDisplay(rating: number): string {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  savings(): number {
    const p = this.product();
    if (!p?.compareAtPrice) return 0;
    return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
  }

  addToCart(): void {
    const p = this.product();
    if (p) this.cartService.addItem(p);
  }

  buyNow(): void {
    const p = this.product();
    if (p) this.cartService.addItem(p);
  }
}
