import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-ofertas',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="page-content">

      <!-- Hero de ofertas -->
      <section class="offers-hero">
        <div class="offers-hero__bg">
          <div class="offers-hero__glow-1"></div>
          <div class="offers-hero__glow-2"></div>
        </div>
        <div class="container">
          <div class="offers-hero__layout">
            <div class="offers-hero__content">
              <div class="offers-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
                Ofertas exclusivas
              </div>
              <h1 class="offers-hero__title">Hasta <span class="offers-hero__pct">40% OFF</span></h1>
              <p class="offers-hero__subtitle">
                Los mejores precios en GPUs, CPUs, RAM y más.
                Ofertas por tiempo limitado con stock disponible.
              </p>
            </div>
            <div class="offers-hero__counters">
              <div class="offer-counter">
                <span class="offer-counter__val">{{ saleCount() }}</span>
                <span class="offer-counter__label">Productos en oferta</span>
              </div>
              <div class="offer-counter">
                <span class="offer-counter__val">S/ 15</span>
                <span class="offer-counter__label">Envío fijo</span>
              </div>
              <div class="offer-counter">
                <span class="offer-counter__val">24h</span>
                <span class="offer-counter__label">Despacho express</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Productos en oferta -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Productos con descuento</h2>
              @if (!loading() && saleProducts().length > 0) {
                <p class="section-subtitle text-secondary">{{ saleProducts().length }} productos disponibles</p>
              }
            </div>
            <a routerLink="/catalog" class="btn btn--ghost">Ver catálogo completo →</a>
          </div>

          @if (loading()) {
            <div class="grid-products">
              <app-skeleton-card [count]="8" />
            </div>
          } @else if (saleProducts().length > 0) {
            <div class="grid-products">
              @for (product of saleProducts(); track product._id) {
                <app-product-card [product]="product" />
              }
            </div>
          } @else {
            <div class="empty-offers">
              <div class="empty-offers__icon">🏷️</div>
              <h3>Nuevas ofertas próximamente</h3>
              <p class="text-secondary">Estamos preparando descuentos especiales. Revisa el catálogo completo mientras tanto.</p>
              <a routerLink="/catalog" class="btn btn--primary" style="margin-top: var(--space-3);">Ver catálogo</a>
            </div>
          }
        </div>
      </section>

      <!-- Todos los productos (si no hay ofertas específicas, mostramos destacados) -->
      @if (!loading() && saleProducts().length === 0 && allProducts().length > 0) {
        <section class="section section--surface">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Todos los productos</h2>
              <a routerLink="/catalog" class="btn btn--ghost">Ver todos →</a>
            </div>
            <div class="grid-products">
              @for (product of allProducts(); track product._id) {
                <app-product-card [product]="product" />
              }
            </div>
          </div>
        </section>
      }

      <!-- Banner informativo -->
      <section class="section">
        <div class="container">
          <div class="info-banners">
            @for (info of infoBanners; track info.title) {
              <div class="info-banner">
                <div class="info-banner__icon">{{ info.icon }}</div>
                <div>
                  <h4 class="info-banner__title">{{ info.title }}</h4>
                  <p class="info-banner__desc">{{ info.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    /* ── Hero ── */
    .offers-hero {
      position: relative;
      background: #0A0A0F;
      overflow: hidden;
      padding: var(--space-8) 0;
    }

    .offers-hero__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .offers-hero__glow-1 {
      position: absolute;
      width: 500px; height: 400px;
      background: radial-gradient(ellipse, rgba(220,38,38,0.2) 0%, transparent 70%);
      top: -80px; left: 0;
    }

    .offers-hero__glow-2 {
      position: absolute;
      width: 400px; height: 300px;
      background: radial-gradient(ellipse, rgba(234,88,12,0.15) 0%, transparent 70%);
      bottom: -50px; right: 0;
    }

    .offers-hero__layout {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-6);
      flex-wrap: wrap;
    }

    .offers-hero__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .offers-hero__badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(220,38,38,0.2);
      border: 1px solid rgba(220,38,38,0.3);
      color: #FCA5A5;
      border-radius: 100px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 700;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .offers-hero__title {
      font-size: clamp(40px, 6vw, 68px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1;
      margin: 0;
    }

    .offers-hero__pct {
      background: linear-gradient(135deg, #F87171, #FB923C);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .offers-hero__subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.5);
      max-width: 400px;
      line-height: 1.6;
      margin: 0;
    }

    .offers-hero__counters {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .offer-counter {
      display: flex;
      flex-direction: column;
      gap: 4px;
      text-align: center;
      min-width: 80px;
    }

    .offer-counter__val {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .offer-counter__label {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Secciones ── */
    .section {
      padding: var(--space-8) 0;
      &--surface { background: var(--color-surface); }
    }

    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-5);
      gap: var(--space-3);
    }

    .section-title {
      font-size: var(--font-size-h2);
      font-weight: var(--font-weight-semibold);
      margin-bottom: 4px;
    }

    .section-subtitle {
      font-size: 13px;
    }

    /* ── Empty state ── */
    .empty-offers {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--space-8);
      gap: var(--space-2);

      &__icon { font-size: 56px; }

      h3 {
        font-size: var(--font-size-h2);
        font-weight: var(--font-weight-semibold);
      }
    }

    /* ── Info banners ── */
    .info-banners {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-2);

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      padding: var(--space-3);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
    }

    .info-banner__icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .info-banner__title {
      font-size: 14px;
      font-weight: var(--font-weight-semibold);
      margin-bottom: 4px;
    }

    .info-banner__desc {
      font-size: 12px;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
  `]
})
export class OfertasComponent implements OnInit {
  private productService = inject(ProductService);

  loading = signal(true);
  allProducts = signal<Product[]>([]);

  saleProducts = computed(() =>
    this.allProducts().filter(p => p.compareAtPrice && p.compareAtPrice > p.price)
  );

  saleCount = computed(() => this.saleProducts().length);

  infoBanners = [
    { icon: '🚚', title: 'Envío rápido', desc: 'Despacho en 24-48 horas a todo el Perú.' },
    { icon: '🛡️', title: 'Garantía oficial', desc: 'Todos los productos tienen garantía del fabricante.' },
    { icon: '↩️', title: 'Devoluciones', desc: '30 días para devoluciones sin preguntas.' },
    { icon: '💳', title: 'Múltiples pagos', desc: 'Tarjeta, transferencia, Yape y más.' },
  ];

  ngOnInit(): void {
    this.productService.getProducts({ limit: 24 }).subscribe({
      next: (res) => {
        this.allProducts.set(res.products);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
