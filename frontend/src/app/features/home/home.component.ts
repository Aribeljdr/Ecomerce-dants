import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="page-content">

      <!-- ══ HERO ══════════════════════════════════════════════════════════ -->
      <section class="hero">
        <div class="hero__bg">
          <div class="hero__glow hero__glow--1"></div>
          <div class="hero__glow hero__glow--2"></div>
          <div class="hero__grid-overlay"></div>
        </div>

        <div class="container">
          <div class="hero__layout">

            <div class="hero__content">
              <div class="hero__pill">
                <span class="hero__pill-dot"></span>
                Hardware de última generación en Perú
              </div>

              <h1 class="hero__title">
                Potencia real.<br>
                <span class="hero__title--accent">Sin límites.</span>
              </h1>

              <p class="hero__subtitle">
                Las mejores GPUs, CPUs y componentes para tu próxima build.
                Garantía oficial, envío a todo el Perú.
              </p>

              <div class="hero__actions">
                <a routerLink="/catalog" class="hero__btn-primary">
                  Explorar catálogo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
                </a>
                <a routerLink="/ofertas" class="hero__btn-ghost">Ver ofertas</a>
              </div>

              <div class="hero__trust">
                <div class="hero__trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>
                  Envío express
                </div>
                <div class="hero__trust-sep"></div>
                <div class="hero__trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Garantía oficial
                </div>
                <div class="hero__trust-sep"></div>
                <div class="hero__trust-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  +5,000 productos
                </div>
              </div>
            </div>

            <div class="hero__visual" aria-hidden="true">
              <div class="hero__cards">
                <div class="spec-card spec-card--1">
                  <div class="spec-card__header">
                    <div class="spec-card__icon-wrap" style="background:rgba(124,58,237,.15)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
                    </div>
                    <span class="spec-card__cat">GPU</span>
                    <span class="spec-card__badge">Nuevo</span>
                  </div>
                  <p class="spec-card__name">RTX 4090</p>
                  <p class="spec-card__detail">24GB GDDR6X · 16,384 CUDA</p>
                  <div class="spec-card__bar"><div class="spec-card__bar-fill" style="width:98%;background:linear-gradient(90deg,#7C3AED,#A78BFA)"></div></div>
                  <p class="spec-card__price">S/ 6,499</p>
                </div>
                <div class="spec-card spec-card--2">
                  <div class="spec-card__header">
                    <div class="spec-card__icon-wrap" style="background:rgba(234,88,12,.15)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="1.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
                    </div>
                    <span class="spec-card__cat">CPU</span>
                  </div>
                  <p class="spec-card__name">Ryzen 9 7950X</p>
                  <p class="spec-card__detail">16C / 32T · 5.7 GHz</p>
                  <div class="spec-card__bar"><div class="spec-card__bar-fill" style="width:92%;background:linear-gradient(90deg,#EA580C,#FBBF24)"></div></div>
                  <p class="spec-card__price">S/ 2,849</p>
                </div>
                <div class="spec-card spec-card--3">
                  <div class="spec-card__header">
                    <div class="spec-card__icon-wrap" style="background:rgba(5,150,105,.15)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8V6m4 2V6m4 2V6m4 2V6M6 16v2m4-2v2m4-2v2m4-2v2"/></svg>
                    </div>
                    <span class="spec-card__cat">RAM</span>
                    <span class="spec-card__badge spec-card__badge--green">Hot</span>
                  </div>
                  <p class="spec-card__name">DDR5 6400MHz</p>
                  <p class="spec-card__detail">32GB Kit · CL32</p>
                  <div class="spec-card__bar"><div class="spec-card__bar-fill" style="width:80%;background:linear-gradient(90deg,#059669,#34D399)"></div></div>
                  <p class="spec-card__price">S/ 549</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ══ NOVEDADES ═════════════════════════════════════════════════════ -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="section-header__left">
              <div class="section-label section-label--new">
                <span class="section-label__dot"></span>
                Recién llegado
              </div>
              <h2 class="section-title">Novedades</h2>
            </div>
            <a routerLink="/catalog" [queryParams]="{sort: '-createdAt'}" class="section-view-all">
              Ver todos
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </a>
          </div>

          <div class="products-row">
            @if (loadingNew()) {
              <app-skeleton-card [count]="4" />
            } @else {
              @for (product of newProducts(); track product._id) {
                <app-product-card [product]="product" />
              }
            }
          </div>
        </div>
      </section>

      <!-- ══ OFERTAS ════════════════════════════════════════════════════════ -->
      <section class="section section--offers">
        <div class="container">
          <div class="section-header">
            <div class="section-header__left">
              <div class="section-label section-label--sale">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>
                Tiempo limitado
              </div>
              <h2 class="section-title">Ofertas destacadas</h2>
            </div>
            <a routerLink="/ofertas" class="section-view-all">
              Ver todas
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </a>
          </div>

          <div class="products-row">
            @if (loadingOffers()) {
              <app-skeleton-card [count]="4" />
            } @else if (offerProducts().length > 0) {
              @for (product of offerProducts(); track product._id) {
                <app-product-card [product]="product" />
              }
            } @else {
              <!-- Fallback: productos populares si no hay ofertas -->
              @for (product of newProducts().slice(0, 4); track product._id) {
                <app-product-card [product]="product" />
              }
            }
          </div>
        </div>
      </section>

      <!-- ══ CATEGORÍAS ════════════════════════════════════════════════════ -->
      <section class="section section--cats">
        <div class="container">
          <div class="section-header">
            <div class="section-header__left">
              <h2 class="section-title">Explora por categoría</h2>
            </div>
            <a routerLink="/catalog" class="section-view-all">
              Ver catálogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
            </a>
          </div>
          <div class="categories-grid">
            @for (cat of quickCategories; track cat.slug) {
              <a [routerLink]="['/catalog', cat.slug]" class="cat-card">
                <div class="cat-card__icon-wrap">
                  <span class="cat-card__icon">{{ cat.icon }}</span>
                </div>
                <span class="cat-card__name">{{ cat.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>

      <!-- ══ BANNER CTA ═════════════════════════════════════════════════════ -->
      <section class="section section--no-pt">
        <div class="container">
          <div class="cta-banner">
            <div class="cta-banner__bg"><div class="cta-banner__glow"></div></div>
            <div class="cta-banner__content">
              <p class="cta-banner__eyebrow">¿Listo para tu próxima build?</p>
              <h2 class="cta-banner__title">Encuentra el componente perfecto</h2>
              <p class="cta-banner__subtitle">Catálogo completo con filtros por presupuesto, marca y rendimiento.</p>
              <div class="cta-banner__actions">
                <a routerLink="/catalog" class="btn btn--primary btn--lg">Ir al catálogo</a>
                <a routerLink="/ofertas" class="cta-banner__link">Ver ofertas →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    /* ── Hero ── */
    .hero {
      position: relative;
      min-height: 600px;
      display: flex;
      align-items: center;
      overflow: hidden;
      background: #0A0A0F;
    }

    .hero__bg {
      position: absolute; inset: 0; pointer-events: none;
    }

    .hero__glow {
      position: absolute; border-radius: 50%;
      filter: blur(80px); opacity: 0.35;
    }

    .hero__glow--1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #4F46E5 0%, transparent 70%);
      top: -100px; right: 5%;
    }

    .hero__glow--2 {
      width: 350px; height: 350px;
      background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
      bottom: -50px; right: 25%;
    }

    .hero__grid-overlay {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    .hero__layout {
      position: relative; z-index: 2;
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: var(--space-8);
      align-items: center;
      padding: var(--space-8) 0;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        .hero__visual { display: none; }
      }
    }

    .hero__content {
      display: flex; flex-direction: column; gap: var(--space-3);
    }

    .hero__pill {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 100px; padding: 6px 14px;
      font-size: 12px; font-weight: 500; color: rgba(255,255,255,.75);
      width: fit-content;
    }

    .hero__pill-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ADE80; box-shadow: 0 0 6px #4ADE80;
      animation: blink 2s infinite;
    }

    @keyframes blink {
      0%,100% { opacity: 1; }
      50%      { opacity: .4; }
    }

    .hero__title {
      font-size: clamp(44px,6vw,72px); font-weight: 800;
      line-height: 1.05; letter-spacing: -.03em; color: #fff; margin: 0;
    }

    .hero__title--accent {
      background: linear-gradient(135deg,#818CF8 0%,#A78BFA 50%,#C084FC 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    .hero__subtitle {
      font-size: 17px; color: rgba(255,255,255,.55);
      max-width: 420px; line-height: 1.65; margin: 0;
    }

    .hero__actions {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 4px;
    }

    .hero__btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fff; color: #000; padding: 12px 24px;
      border-radius: 10px; font-size: 15px; font-weight: 600;
      text-decoration: none; transition: all 200ms ease;
      &:hover { background: #F0F0F0; gap: 10px; }
    }

    .hero__btn-ghost {
      display: inline-flex; align-items: center;
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.12);
      color: rgba(255,255,255,.8); padding: 12px 20px;
      border-radius: 10px; font-size: 15px; font-weight: 500;
      text-decoration: none; transition: all 200ms ease;
      &:hover { background: rgba(255,255,255,.12); color: #fff; }
    }

    .hero__trust {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px;
    }

    .hero__trust-item {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: rgba(255,255,255,.45); font-weight: 500;
      svg { color: rgba(255,255,255,.4); }
    }

    .hero__trust-sep { width: 1px; height: 12px; background: rgba(255,255,255,.15); }

    /* Spec cards */
    .hero__visual { position: relative; }

    .hero__cards { display: flex; flex-direction: column; gap: 12px; }

    .spec-card {
      background: rgba(255,255,255,.05); backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 14px; padding: 16px 18px;
      display: flex; flex-direction: column; gap: 8px;
      &--1 { animation: floatCard 6s ease-in-out infinite; }
      &--2 { animation: floatCard 6s ease-in-out infinite 2s; }
      &--3 { animation: floatCard 6s ease-in-out infinite 4s; }
    }

    @keyframes floatCard {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }

    .spec-card__header { display: flex; align-items: center; gap: 8px; }

    .spec-card__icon-wrap {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .spec-card__cat {
      font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4);
      text-transform: uppercase; letter-spacing: .08em; flex: 1;
    }

    .spec-card__badge {
      font-size: 10px; font-weight: 700;
      background: rgba(124,58,237,.3); color: #C084FC;
      padding: 2px 8px; border-radius: 100px;
      &--green { background: rgba(5,150,105,.3); color: #34D399; }
    }

    .spec-card__name { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -.02em; margin: 0; }
    .spec-card__detail { font-size: 12px; color: rgba(255,255,255,.4); margin: 0; }

    .spec-card__bar {
      height: 3px; background: rgba(255,255,255,.08); border-radius: 100px; overflow: hidden;
    }

    .spec-card__bar-fill { height: 100%; border-radius: 100px; }
    .spec-card__price { font-size: 15px; font-weight: 700; color: rgba(255,255,255,.8); margin: 0; }

    /* ── Secciones ── */
    .section { padding: var(--space-8) 0; }
    .section--offers { background: #FAFAFA; }
    .section--cats   { background: var(--color-white); }
    .section--no-pt  { padding-top: 0; }

    /* ── Section header ── */
    .section-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: var(--space-4); gap: var(--space-2);
    }

    .section-header__left {
      display: flex; flex-direction: column; gap: 6px;
    }

    .section-title {
      font-size: clamp(20px, 2.5vw, 26px);
      font-weight: var(--font-weight-bold);
      letter-spacing: -.02em;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .section-label {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em;
      padding: 3px 10px; border-radius: 100px; width: fit-content;

      &--new {
        background: #ECFDF5; color: #059669;
        border: 1px solid #A7F3D0;
      }

      &--sale {
        background: #FEF2F2; color: #DC2626;
        border: 1px solid #FECACA;
      }
    }

    .section-label__dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #059669; animation: blink 2s infinite;
    }

    .section-view-all {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 13px; font-weight: 600;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: all 150ms ease;
      white-space: nowrap;
      padding-bottom: 2px;

      svg { transition: transform 150ms ease; }
      &:hover { color: var(--color-text-primary); svg { transform: translateX(3px); } }
    }

    /* ── Fila de productos (4 columnas) ── */
    .products-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);

      @media (max-width: 960px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 680px) { grid-template-columns: repeat(2, 1fr); }
    }

    /* ── Categorías ── */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: var(--space-2);

      @media (max-width: 960px) { grid-template-columns: repeat(4, 1fr); }
      @media (max-width: 560px) { grid-template-columns: repeat(4, 1fr); }
    }

    .cat-card {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: var(--space-3) var(--space-1);
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
      border: 1px solid transparent;

      &:hover {
        background: #fff;
        border-color: var(--color-border);
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0,0,0,.07);
      }
    }

    .cat-card__icon-wrap {
      width: 44px; height: 44px;
      background: #fff; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
      transition: transform var(--transition-fast);
    }

    .cat-card:hover .cat-card__icon-wrap { transform: scale(1.1); }

    .cat-card__name {
      font-size: 11px; font-weight: 600;
      color: var(--color-text-primary); text-align: center; line-height: 1.3;
    }

    /* ── CTA Banner ── */
    .cta-banner {
      position: relative; background: #0A0A0F;
      border-radius: 20px; overflow: hidden; padding: var(--space-8);
    }

    .cta-banner__bg { position: absolute; inset: 0; pointer-events: none; }

    .cta-banner__glow {
      position: absolute;
      width: 600px; height: 300px;
      background: radial-gradient(ellipse, rgba(99,102,241,.25) 0%, transparent 70%);
      top: -50px; left: -100px;
    }

    .cta-banner__content { position: relative; z-index: 1; max-width: 540px; }

    .cta-banner__eyebrow {
      font-size: 12px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .1em; color: rgba(255,255,255,.4); margin-bottom: var(--space-2);
    }

    .cta-banner__title {
      font-size: clamp(24px,3vw,36px); font-weight: 800; color: #fff;
      letter-spacing: -.02em; line-height: 1.1; margin-bottom: var(--space-2);
    }

    .cta-banner__subtitle {
      font-size: 15px; color: rgba(255,255,255,.5); line-height: 1.6; margin-bottom: var(--space-4);
    }

    .cta-banner__actions { display: flex; align-items: center; gap: var(--space-3); }

    .cta-banner__link {
      font-size: 14px; font-weight: 600; color: rgba(255,255,255,.6);
      text-decoration: none; transition: color 200ms;
      &:hover { color: rgba(255,255,255,.9); }
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);

  loadingNew    = signal(true);
  loadingOffers = signal(true);
  newProducts   = signal<Product[]>([]);
  allForOffers  = signal<Product[]>([]);

  offerProducts = computed(() =>
    this.allForOffers().filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 4)
  );

  quickCategories = [
    { name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas', icon: '🎮' },
    { name: 'Procesadores',      slug: 'procesadores',      icon: '⚡' },
    { name: 'Memoria RAM',       slug: 'memoria-ram',       icon: '💾' },
    { name: 'Almacenamiento',    slug: 'almacenamiento',    icon: '💿' },
    { name: 'Teclados',          slug: 'teclados',          icon: '⌨️' },
    { name: 'Mouse',             slug: 'mouse',             icon: '🖱️' },
    { name: 'Refrigeración',     slug: 'refrigeracion',     icon: '❄️' },
    { name: 'Tarjetas Madre',    slug: 'tarjetas-madre',    icon: '🔧' },
  ];

  ngOnInit(): void {
    // Novedades: los más recientes
    this.productService.getProducts({ sort: '-createdAt', limit: 4 } as any).subscribe({
      next: (res) => { this.newProducts.set(res.products); this.loadingNew.set(false); },
      error: () => this.loadingNew.set(false),
    });

    // Ofertas: cargar lote y filtrar por compareAtPrice
    this.productService.getProducts({ limit: 20 } as any).subscribe({
      next: (res) => { this.allForOffers.set(res.products); this.loadingOffers.set(false); },
      error: () => this.loadingOffers.set(false),
    });
  }
}
