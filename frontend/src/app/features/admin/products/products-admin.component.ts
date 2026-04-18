import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models/product.model';

interface ProductForm {
  name: string;
  brand: string;
  category: string;
  price: number | null;
  compareAtPrice: number | null;
  stock: number | null;
  description: string;
  images: string[];
  featured: boolean;
  isActive: boolean;
  tags: string;
  specs: { key: string; value: string }[];
}

const emptyForm = (): ProductForm => ({
  name: '',
  brand: '',
  category: '',
  price: null,
  compareAtPrice: null,
  stock: null,
  description: '',
  images: ['', '', ''],
  featured: false,
  isActive: true,
  tags: '',
  specs: [{ key: '', value: '' }]
});

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pa-container">
      <!-- Header -->
      <div class="pa-header">
        <div>
          <h1 class="pa-title">Productos</h1>
          <p class="pa-sub">{{ total() }} productos en total</p>
        </div>
        <button class="btn btn--primary btn--sm" (click)="openCreate()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </div>

      <!-- Toolbar -->
      <div class="pa-toolbar">
        <div class="pa-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="form-input pa-search__input"
            type="text"
            placeholder="Buscar por nombre..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
          />
        </div>
        <select class="form-input pa-filter" [(ngModel)]="filterCategory" (ngModelChange)="load()">
          <option value="">Todas las categorías</option>
          @for (cat of categories(); track cat._id) {
            <option [value]="cat._id">{{ cat.name }}</option>
          }
        </select>
      </div>

      <!-- Table -->
      @if (loading()) {
        <div class="pa-loading">
          @for (n of [1,2,3,4,5]; track n) {
            <div class="pa-row-skeleton shimmer"></div>
          }
        </div>
      } @else if (products().length === 0) {
        <div class="pa-empty">
          <p>No hay productos. ¡Creá el primero!</p>
        </div>
      } @else {
        <div class="pa-table-wrap">
          <table class="pa-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of products(); track p._id) {
                <tr class="pa-table__row">
                  <td class="pa-table__product">
                    @if (p.images[0]) {
                      <img [src]="p.images[0]" [alt]="p.name" class="pa-table__img" />
                    } @else {
                      <div class="pa-table__img pa-table__img--placeholder">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21,15 16,10 5,21"/>
                        </svg>
                      </div>
                    }
                    <span class="pa-table__name">{{ p.name }}</span>
                  </td>
                  <td class="pa-table__cell">{{ p.category?.name ?? '—' }}</td>
                  <td class="pa-table__cell">{{ p.brand || '—' }}</td>
                  <td class="pa-table__cell pa-table__price">\${{ p.price | number:'1.0-0' }}</td>
                  <td class="pa-table__cell">
                    <span class="stock-badge" [ngClass]="stockClass(p.stock)">{{ p.stock }}</span>
                  </td>
                  <td class="pa-table__cell">
                    <span class="status-badge" [ngClass]="p.isActive ? 'status-badge--active' : 'status-badge--inactive'">
                      {{ p.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="pa-table__actions">
                    <button class="action-btn action-btn--edit" (click)="openEdit(p)" title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="action-btn action-btn--delete" (click)="confirmDeleteId.set(p._id)" title="Eliminar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                        <path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (pages() > 1) {
          <div class="pa-pagination">
            <button class="btn btn--secondary btn--sm" [disabled]="currentPage() <= 1" (click)="goPage(currentPage() - 1)">
              ← Anterior
            </button>
            <span class="pa-pagination__info">Página {{ currentPage() }} de {{ pages() }}</span>
            <button class="btn btn--secondary btn--sm" [disabled]="currentPage() >= pages()" (click)="goPage(currentPage() + 1)">
              Siguiente →
            </button>
          </div>
        }
      }
    </div>

    <!-- Delete Confirmation Modal -->
    @if (confirmDeleteId()) {
      <div class="modal-backdrop" (click)="confirmDeleteId.set(null)">
        <div class="modal-confirm" (click)="$event.stopPropagation()">
          <h3 class="modal-confirm__title">¿Eliminar producto?</h3>
          <p class="modal-confirm__text">Esta acción no se puede deshacer.</p>
          <div class="modal-confirm__actions">
            <button class="btn btn--secondary btn--sm" (click)="confirmDeleteId.set(null)">Cancelar</button>
            <button class="btn btn--danger btn--sm" [disabled]="deleting()" (click)="deleteProduct()">
              {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Product Form Modal -->
    @if (modalOpen()) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-panel" (click)="$event.stopPropagation()">
          <div class="modal-panel__header">
            <h2 class="modal-panel__title">{{ editing() ? 'Editar producto' : 'Nuevo producto' }}</h2>
            <button class="modal-close" (click)="closeModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-panel__body">
            @if (saveError()) {
              <div class="form-error-banner">{{ saveError() }}</div>
            }

            <!-- Basic info -->
            <div class="form-section">
              <h3 class="form-section__title">Información básica</h3>
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label">Nombre *</label>
                  <input class="form-input" type="text" [(ngModel)]="form().name" placeholder="Ej: RTX 4070 Super" />
                </div>
                <div class="form-group">
                  <label class="form-label">Marca *</label>
                  <input class="form-input" type="text" [(ngModel)]="form().brand" placeholder="Ej: NVIDIA" />
                </div>
                <div class="form-group">
                  <label class="form-label">Categoría</label>
                  <select class="form-input" [(ngModel)]="form().category">
                    <option value="">Sin categoría</option>
                    @for (cat of categories(); track cat._id) {
                      <option [value]="cat._id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tags (separados por coma)</label>
                  <input class="form-input" type="text" [(ngModel)]="form().tags" placeholder="gaming, rgb, oferta" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-input form-textarea" rows="3" [(ngModel)]="form().description" placeholder="Descripción del producto..."></textarea>
              </div>
            </div>

            <!-- Pricing & Stock -->
            <div class="form-section">
              <h3 class="form-section__title">Precio y stock</h3>
              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label">Precio *</label>
                  <input class="form-input" type="number" min="0" [(ngModel)]="form().price" placeholder="0.00" />
                </div>
                <div class="form-group">
                  <label class="form-label">Precio tachado</label>
                  <input class="form-input" type="number" min="0" [(ngModel)]="form().compareAtPrice" placeholder="Precio original" />
                  <span class="form-hint">Opcional. Se muestra como tachado.</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Stock *</label>
                  <input class="form-input" type="number" min="0" [(ngModel)]="form().stock" placeholder="0" />
                </div>
              </div>
            </div>

            <!-- Images -->
            <div class="form-section">
              <h3 class="form-section__title">Imágenes (URLs)</h3>
              @for (img of form().images; track $index) {
                <div class="form-group">
                  <label class="form-label">Imagen {{ $index + 1 }}</label>
                  <input
                    class="form-input"
                    type="url"
                    [ngModel]="form().images[$index]"
                    (ngModelChange)="updateImage($index, $event)"
                    placeholder="https://..."
                  />
                </div>
              }
            </div>

            <!-- Specs -->
            <div class="form-section">
              <h3 class="form-section__title">Especificaciones</h3>
              @for (spec of form().specs; track $index) {
                <div class="spec-row">
                  <input
                    class="form-input"
                    type="text"
                    placeholder="Propiedad (ej: VRAM)"
                    [ngModel]="spec.key"
                    (ngModelChange)="updateSpec($index, 'key', $event)"
                  />
                  <input
                    class="form-input"
                    type="text"
                    placeholder="Valor (ej: 12GB)"
                    [ngModel]="spec.value"
                    (ngModelChange)="updateSpec($index, 'value', $event)"
                  />
                  <button class="spec-remove" (click)="removeSpec($index)" type="button">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              }
              <button class="btn btn--secondary btn--sm" type="button" (click)="addSpec()">
                + Agregar especificación
              </button>
            </div>

            <!-- Flags -->
            <div class="form-section">
              <h3 class="form-section__title">Configuración</h3>
              <div class="toggle-row">
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="form().isActive" class="toggle-checkbox" />
                  <span class="toggle-text">Producto activo</span>
                </label>
                <label class="toggle-label">
                  <input type="checkbox" [(ngModel)]="form().featured" class="toggle-checkbox" />
                  <span class="toggle-text">Destacado en home</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-panel__footer">
            <button class="btn btn--secondary btn--sm" (click)="closeModal()">Cancelar</button>
            <button class="btn btn--primary btn--sm" [disabled]="saving()" (click)="save()">
              {{ saving() ? 'Guardando...' : (editing() ? 'Guardar cambios' : 'Crear producto') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .pa-container {
      padding: var(--space-4) var(--space-4) var(--space-8);
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .pa-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-3);
    }

    .pa-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .pa-sub {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .pa-toolbar {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
      flex-wrap: wrap;
    }

    .pa-search {
      position: relative;
      flex: 1;
      min-width: 200px;
    }

    .pa-search svg {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-secondary);
      pointer-events: none;
    }

    .pa-search__input {
      padding-left: 36px;
      width: 100%;
    }

    .pa-filter {
      width: 200px;
    }

    .pa-loading {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .pa-row-skeleton {
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

    .pa-empty {
      text-align: center;
      padding: var(--space-6);
      color: var(--color-text-secondary);
      font-size: 14px;
      background: var(--color-surface);
      border-radius: var(--radius-xl);
    }

    .pa-table-wrap {
      overflow-x: auto;
      border-radius: var(--radius-xl);
      background: var(--color-surface);
    }

    .pa-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .pa-table thead tr {
      border-bottom: 1px solid var(--color-border);
    }

    .pa-table th {
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      text-align: left;
    }

    .pa-table__row {
      border-bottom: 1px solid var(--color-border);
      transition: background 150ms ease;
    }

    .pa-table__row:last-child {
      border-bottom: none;
    }

    .pa-table__row:hover {
      background: rgba(0,0,0,0.02);
    }

    .pa-table__product {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
    }

    .pa-table__img {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      object-fit: cover;
      flex-shrink: 0;
      background: #f0f0f0;
    }

    .pa-table__img--placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
    }

    .pa-table__name {
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .pa-table__cell {
      padding: 10px 14px;
      color: var(--color-text-secondary);
    }

    .pa-table__price {
      color: var(--color-text-primary);
      font-weight: 600;
    }

    .pa-table__actions {
      padding: 10px 14px;
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .action-btn {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 150ms ease, color 150ms ease;
    }

    .action-btn--edit {
      background: #EFF6FF;
      color: #2563EB;
    }

    .action-btn--edit:hover {
      background: #DBEAFE;
    }

    .action-btn--delete {
      background: #FFF5F5;
      color: var(--color-error);
    }

    .action-btn--delete:hover {
      background: #FED7D7;
    }

    .stock-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
    }

    .stock-badge--out    { background: #FEE2E2; color: #DC2626; }
    .stock-badge--low    { background: #FEF3C7; color: #D97706; }
    .stock-badge--ok     { background: #DCFCE7; color: #16A34A; }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .status-badge--active   { background: #DCFCE7; color: #16A34A; }
    .status-badge--inactive { background: #F3F4F6; color: #6B7280; }

    .pa-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }

    .pa-pagination__info {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    /* Modal backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2);
    }

    /* Confirm dialog */
    .modal-confirm {
      background: #fff;
      border-radius: var(--radius-xl);
      padding: var(--space-4);
      width: 360px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    .modal-confirm__title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .modal-confirm__text {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-3);
    }

    .modal-confirm__actions {
      display: flex;
      gap: var(--space-1);
      justify-content: flex-end;
    }

    .btn--danger {
      background: var(--color-error);
      color: #fff;
      border: none;
    }

    .btn--danger:hover:not(:disabled) {
      background: #E0352B;
    }

    /* Form modal */
    .modal-panel {
      background: #fff;
      border-radius: var(--radius-xl);
      width: 680px;
      max-width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }

    .modal-panel__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .modal-panel__title {
      font-size: 16px;
      font-weight: 700;
    }

    .modal-close {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      border: none;
      background: var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: background 150ms ease;
    }

    .modal-close:hover {
      background: var(--color-border);
    }

    .modal-panel__body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-3) var(--space-4);
    }

    .modal-panel__footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-4);
      border-top: 1px solid var(--color-border);
      flex-shrink: 0;
    }

    .form-section {
      margin-bottom: var(--space-3);
    }

    .form-section__title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
    }

    .form-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: var(--space-2);
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .spec-row {
      display: grid;
      grid-template-columns: 1fr 1fr 32px;
      gap: 8px;
      margin-bottom: 8px;
      align-items: center;
    }

    .spec-remove {
      width: 32px;
      height: 36px;
      border: none;
      background: #FFF5F5;
      color: var(--color-error);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 150ms ease;
    }

    .spec-remove:hover {
      background: #FED7D7;
    }

    .toggle-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 13px;
    }

    .toggle-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--color-black);
    }

    .toggle-text {
      color: var(--color-text-primary);
    }

    .form-error-banner {
      background: #FFF5F5;
      border: 1px solid #FED7D7;
      color: var(--color-error);
      border-radius: var(--radius-md);
      padding: 10px var(--space-2);
      font-size: 13px;
      margin-bottom: var(--space-2);
    }
  `]
})
export class ProductsAdminComponent implements OnInit {
  private productSvc = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  saving = signal(false);
  deleting = signal(false);
  modalOpen = signal(false);
  editing = signal<Product | null>(null);
  confirmDeleteId = signal<string | null>(null);
  saveError = signal<string | null>(null);
  total = signal(0);
  pages = signal(1);
  currentPage = signal(1);
  searchQuery = '';
  filterCategory = '';

  form = signal<ProductForm>(emptyForm());
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.loadCategories();
    this.load();
  }

  load() {
    this.loading.set(true);
    const filters: Record<string, string> = {};
    if (this.searchQuery) filters['search'] = this.searchQuery;
    if (this.filterCategory) filters['category'] = this.filterCategory;
    filters['page'] = String(this.currentPage());
    filters['limit'] = '20';

    this.productSvc.getProductsRaw(filters).subscribe({
      next: res => {
        this.products.set(res.products);
        this.total.set(res.total);
        this.pages.set(res.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCategories() {
    this.productSvc.getCategories().subscribe({
      next: res => this.categories.set(res.categories)
    });
  }

  onSearch() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.load();
    }, 400);
  }

  goPage(p: number) {
    this.currentPage.set(p);
    this.load();
  }

  openCreate() {
    this.editing.set(null);
    this.form.set(emptyForm());
    this.saveError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(p: Product) {
    this.editing.set(p);
    const specs = p.specs
      ? Object.entries(p.specs).map(([key, value]) => ({ key, value: String(value) }))
      : [];
    if (specs.length === 0) specs.push({ key: '', value: '' });

    const images = [...(p.images || [])];
    while (images.length < 3) images.push('');

    this.form.set({
      name: p.name,
      brand: p.brand,
      category: typeof p.category === 'object' ? p.category._id : (p.category as string) || '',
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      stock: p.stock,
      description: p.description,
      images,
      featured: p.featured,
      isActive: p.isActive,
      tags: (p.tags || []).join(', '),
      specs
    });
    this.saveError.set(null);
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
    this.editing.set(null);
    this.saveError.set(null);
  }

  updateImage(index: number, value: string) {
    const imgs = [...this.form().images];
    imgs[index] = value;
    this.form.update(f => ({ ...f, images: imgs }));
  }

  addSpec() {
    this.form.update(f => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  }

  removeSpec(i: number) {
    this.form.update(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  }

  updateSpec(index: number, field: 'key' | 'value', value: string) {
    const specs = [...this.form().specs];
    specs[index] = { ...specs[index], [field]: value };
    this.form.update(f => ({ ...f, specs }));
  }

  save() {
    const f = this.form();
    if (!f.name.trim()) { this.saveError.set('El nombre es obligatorio.'); return; }
    if (f.price === null || f.price < 0) { this.saveError.set('El precio es obligatorio.'); return; }
    if (f.stock === null || f.stock < 0) { this.saveError.set('El stock es obligatorio.'); return; }

    this.saving.set(true);
    this.saveError.set(null);

    const specs: Record<string, string> = {};
    f.specs.forEach(s => { if (s.key.trim()) specs[s.key.trim()] = s.value; });

    const payload: Partial<Product> = {
      name: f.name.trim(),
      brand: f.brand.trim(),
      price: f.price!,
      stock: f.stock!,
      description: f.description.trim(),
      images: f.images.filter(img => img.trim() !== ''),
      featured: f.featured,
      isActive: f.isActive,
      tags: f.tags.split(',').map(t => t.trim()).filter(t => t),
      specs
    };

    if (f.category) (payload as Record<string, unknown>)['category'] = f.category;
    if (f.compareAtPrice !== null && f.compareAtPrice > 0) payload.compareAtPrice = f.compareAtPrice;

    const p = this.editing();
    const req = p
      ? this.productSvc.updateProduct(p._id, payload)
      : this.productSvc.createProduct(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message || 'Error al guardar. Intentá de nuevo.');
      }
    });
  }

  deleteProduct() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.deleting.set(true);
    this.productSvc.deleteProduct(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.confirmDeleteId.set(null);
        this.load();
      },
      error: () => {
        this.deleting.set(false);
        this.confirmDeleteId.set(null);
      }
    });
  }

  stockClass(stock: number): string {
    if (stock === 0) return 'stock-badge--out';
    if (stock <= 5) return 'stock-badge--low';
    return 'stock-badge--ok';
  }
}
