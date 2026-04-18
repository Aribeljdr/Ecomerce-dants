import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SkeletonCardComponent } from '../../shared/components/skeleton-card/skeleton-card.component';

interface SortOption { label: string; value: string; icon: string; }

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, SkeletonCardComponent],
  template: `
    <div class="page-content">
      <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-8);">
        <div class="catalog-layout">

          <!-- ── Sidebar: solo categorías ─────────────────────────────────── -->
          <aside class="cat-sidebar">
            <h3 class="cat-sidebar__title">Categorías</h3>

            @if (categoriesLoading()) {
              <div class="cat-skeleton">
                @for (n of [1,2,3,4,5,6]; track n) {
                  <div class="shimmer cat-skeleton__item"></div>
                }
              </div>
            } @else {
              <nav class="cat-nav">
                <button class="cat-item" [class.cat-item--active]="categorySlug() === null"
                  (click)="selectCategory(null)">
                  <span class="cat-item__icon">🛒</span>
                  <span class="cat-item__name">Todos</span>
                  @if (categorySlug() === null) {
                    <span class="cat-item__dot"></span>
                  }
                </button>
                @for (cat of categories(); track cat._id) {
                  <button class="cat-item" [class.cat-item--active]="categorySlug() === cat.slug"
                    (click)="selectCategory(cat.slug)">
                    @if (cat.icon) { <span class="cat-item__icon">{{ cat.icon }}</span> }
                    <span class="cat-item__name">{{ cat.name }}</span>
                    @if (categorySlug() === cat.slug) {
                      <span class="cat-item__dot"></span>
                    }
                  </button>
                }
              </nav>
            }
          </aside>

          <!-- ── Área principal ──────────────────────────────────────────── -->
          <main class="catalog-main">

            <!-- Barra de filtros activos -->
            <div class="filter-bar">
              <!-- Pills de orden -->
              <div class="sort-pills">
                @for (opt of sortOptions; track opt.value) {
                  <button class="sort-pill"
                    [class.sort-pill--active]="sort() === opt.value && !onSale()"
                    (click)="setSort(opt.value)">
                    <span>{{ opt.icon }}</span>
                    {{ opt.label }}
                  </button>
                }
                <!-- En oferta como toggle aparte -->
                <button class="sort-pill sort-pill--sale"
                  [class.sort-pill--active]="onSale()"
                  (click)="toggleOnSale()">
                  🏷️ En oferta
                </button>
              </div>

              <!-- Select de marca -->
              <div class="brand-select-wrap">
                @if (brandsLoading()) {
                  <div class="shimmer" style="width:160px;height:36px;border-radius:8px;"></div>
                } @else if (brands().length > 0) {
                  <select class="brand-select"
                    [ngModel]="selectedBrand()"
                    (ngModelChange)="setBrand($event)">
                    <option value="">Todas las marcas</option>
                    @for (b of brands(); track b) {
                      <option [value]="b">{{ b }}</option>
                    }
                  </select>
                }
              </div>

              <!-- Limpiar (solo si hay algo activo) -->
              @if (hasActiveFilters()) {
                <button class="clear-btn" (click)="resetFilters()">
                  Limpiar ×
                </button>
              }
            </div>

            <!-- Título + conteo -->
            <div class="catalog-header">
              <h1 class="catalog-header__title">{{ pageTitle() }}</h1>
              <span class="text-secondary" style="font-size:13px;">
                @if (loading()) { Cargando... } @else { {{ total() }} productos }
              </span>
            </div>

            <!-- Grid -->
            <div class="grid-products">
              @if (loading()) {
                <app-skeleton-card [count]="12" />
              } @else if (products().length === 0) {
                <div class="catalog-empty">
                  <div class="catalog-empty__icon">🔍</div>
                  <p>No encontramos productos con estos filtros.</p>
                  <button class="btn btn--secondary" (click)="resetFilters()">Ver todos</button>
                </div>
              } @else {
                @for (product of products(); track product._id) {
                  <app-product-card [product]="product" />
                }
              }
            </div>

            <!-- Paginación -->
            @if (pages() > 1) {
              <div class="pagination">
                <button class="btn btn--secondary btn--sm"
                  [disabled]="page() === 1"
                  (click)="goToPage(page() - 1)">← Anterior</button>
                <span class="text-secondary" style="font-size:13px;">
                  Página {{ page() }} de {{ pages() }}
                </span>
                <button class="btn btn--secondary btn--sm"
                  [disabled]="page() === pages()"
                  (click)="goToPage(page() + 1)">Siguiente →</button>
              </div>
            }
          </main>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: var(--space-6);
      align-items: start;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    /* ── Sidebar categorías ─────────────────────────────────────────────── */
    .cat-sidebar {
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-3));
      max-height: calc(100vh - var(--navbar-height) - var(--space-4));
      overflow-y: auto;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-3);
      scrollbar-width: thin;
      scrollbar-color: var(--color-border) transparent;
    }

    .cat-sidebar__title {
      font-size: 12px;
      font-weight: var(--font-weight-bold);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: var(--space-2);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }

    .cat-skeleton {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cat-skeleton__item {
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--color-border);
    }

    .cat-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cat-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
      transition: background var(--transition-fast);
      user-select: none;

      &:hover { background: var(--color-border); }

      &__icon { font-size: 16px; flex-shrink: 0; }

      &__name { flex: 1; }

      &__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--color-text-primary);
        flex-shrink: 0;
      }

      &--active {
        background: var(--color-text-primary);
        color: var(--color-white);
        font-weight: var(--font-weight-medium);

        .cat-item__dot { background: var(--color-white); }
        &:hover { background: var(--color-text-primary); }
      }
    }

    /* ── Barra de filtros ───────────────────────────────────────────────── */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: 10px var(--space-3);
      margin-bottom: var(--space-4);
    }

    .sort-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      flex: 1;
    }

    .sort-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 13px;
      border: 1.5px solid var(--color-border);
      background: transparent;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;

      &:hover {
        border-color: var(--color-text-primary);
        color: var(--color-text-primary);
      }

      &--active {
        background: var(--color-text-primary);
        border-color: var(--color-text-primary);
        color: var(--color-white);
        font-weight: var(--font-weight-medium);
      }

      &--sale {
        border-color: #f59e0b;
        color: #b45309;

        &:hover { background: #fef3c7; }
        &.sort-pill--active {
          background: #f59e0b;
          border-color: #f59e0b;
          color: #fff;
        }
      }
    }

    .brand-select-wrap { display: flex; align-items: center; }

    .brand-select {
      height: 36px;
      padding: 0 12px;
      border-radius: 100px;
      border: 1.5px solid var(--color-border);
      background: transparent;
      font-size: 13px;
      color: var(--color-text-primary);
      cursor: pointer;
      outline: none;
      transition: border-color var(--transition-fast);

      &:hover, &:focus { border-color: var(--color-text-primary); }
    }

    .clear-btn {
      padding: 6px 14px;
      border-radius: 100px;
      border: 1.5px solid var(--color-border);
      background: transparent;
      font-size: 13px;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;

      &:hover {
        border-color: #ef4444;
        color: #ef4444;
      }
    }

    /* ── Header catálogo ────────────────────────────────────────────────── */
    .catalog-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: var(--space-4);
      gap: var(--space-2);
    }

    .catalog-header__title {
      font-size: var(--font-size-h2);
      font-weight: var(--font-weight-bold);
      text-transform: capitalize;
    }

    /* ── Empty ──────────────────────────────────────────────────────────── */
    .catalog-empty {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-8);
      text-align: center;
      color: var(--color-text-secondary);

      &__icon { font-size: 40px; }
    }

    /* ── Paginación ─────────────────────────────────────────────────────── */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      margin-top: var(--space-6);
    }
  `]
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);

  loading           = signal(true);
  brandsLoading     = signal(false);
  categoriesLoading = signal(true);
  products          = signal<Product[]>([]);
  brands            = signal<string[]>([]);
  categories        = signal<Category[]>([]);
  total             = signal(0);
  page              = signal(1);
  pages             = signal(1);
  selectedBrand     = signal('');
  sort              = signal('-createdAt');
  onSale            = signal(false);
  categorySlug      = signal<string | null>(null);

  readonly sortOptions: SortOption[] = [
    { label: 'Mayor a menor', value: '-price',    icon: '↓' },
    { label: 'Menor a mayor', value: 'price',     icon: '↑' },
    { label: 'Más destacado', value: '-rating',   icon: '⭐' },
  ];

  pageTitle = computed(() => {
    const slug = this.categorySlug();
    if (!slug) return 'Todos los productos';
    const cat = this.categories().find(c => c.slug === slug);
    return cat ? cat.name : slug.replace(/-/g, ' ');
  });

  hasActiveFilters = computed(() =>
    !!this.categorySlug() ||
    !!this.selectedBrand() ||
    this.sort() !== '-createdAt' ||
    this.onSale()
  );

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: res => {
        this.categories.set(res.categories.filter(c => !c.parent));
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false),
    });

    this.route.paramMap.subscribe(params => {
      const cat = params.get('category');
      this.categorySlug.set(cat);
      this.page.set(1);
      this.selectedBrand.set('');
      this.loadBrands(cat);
      this.applyFilters();
    });

    this.route.queryParamMap.subscribe(qp => {
      const b = qp.get('brands');
      if (b) {
        const first = b.split(',')[0]?.trim() ?? '';
        this.selectedBrand.set(first);
        this.page.set(1);
        this.applyFilters();
      }
    });
  }

  selectCategory(slug: string | null): void {
    this.categorySlug.set(slug);
    this.selectedBrand.set('');
    this.sort.set('-createdAt');
    this.onSale.set(false);
    this.page.set(1);
    this.loadBrands(slug);
    this.applyFilters();
    if (slug) {
      this.router.navigate(['/catalog', slug], { replaceUrl: true });
    } else {
      this.router.navigate(['/catalog'], { replaceUrl: true });
    }
  }

  private loadBrands(categorySlug: string | null): void {
    this.brandsLoading.set(true);
    this.productService.getBrands(categorySlug ?? undefined).subscribe({
      next: res => { this.brands.set(res.brands); this.brandsLoading.set(false); },
      error: () => this.brandsLoading.set(false),
    });
  }

  applyFilters(): void {
    this.loading.set(true);

    const params: Record<string, string> = {
      sort:  this.sort(),
      page:  String(this.page()),
      limit: '12',
    };

    const slug = this.categorySlug();
    if (slug) params['categorySlug'] = slug;

    const brand = this.selectedBrand();
    if (brand) params['brands'] = brand;

    if (this.onSale()) params['featured'] = 'true';

    this.productService.getProductsRaw(params).subscribe({
      next: res => {
        this.products.set(res.products);
        this.total.set(res.total);
        this.pages.set(res.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setBrand(val: string): void {
    this.selectedBrand.set(val);
    this.page.set(1);
    this.applyFilters();
  }

  setSort(val: string): void {
    this.onSale.set(false);
    this.sort.set(val);
    this.page.set(1);
    this.applyFilters();
  }

  toggleOnSale(): void {
    this.onSale.update(v => !v);
    this.sort.set('-createdAt');
    this.page.set(1);
    this.applyFilters();
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetFilters(): void {
    this.selectedBrand.set('');
    this.sort.set('-createdAt');
    this.onSale.set(false);
    this.categorySlug.set(null);
    this.page.set(1);
    this.loadBrands(null);
    this.applyFilters();
    this.router.navigate(['/catalog'], { replaceUrl: true });
  }
}
