import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models/product.model';

interface CategoryForm {
  name: string;
  parent: string;
  icon: string;
  order: number | null;
}

const emptyForm = (): CategoryForm => ({
  name: '',
  parent: '',
  icon: '',
  order: null
});

@Component({
  selector: 'app-categories-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ca-container">
      <!-- Header -->
      <div class="ca-header">
        <div>
          <h1 class="ca-title">Categorías</h1>
          <p class="ca-sub">{{ categories().length }} categorías en total</p>
        </div>
      </div>

      <div class="ca-layout">
        <!-- List -->
        <div class="ca-list-panel">
          <h3 class="ca-panel-title">Todas las categorías</h3>

          @if (loading()) {
            @for (n of [1,2,3,4]; track n) {
              <div class="ca-skeleton shimmer"></div>
            }
          } @else if (categories().length === 0) {
            <div class="ca-empty">
              <p>No hay categorías creadas aún.</p>
            </div>
          } @else {
            <div class="ca-tree">
              @for (cat of rootCategories(); track cat._id) {
                <div class="ca-item">
                  <div class="ca-item__row">
                    <span class="ca-item__icon">{{ cat.icon || '📁' }}</span>
                    <span class="ca-item__name">{{ cat.name }}</span>
                    @if (cat.order !== undefined) {
                      <span class="ca-item__order">#{{ cat.order }}</span>
                    }
                    <button
                      class="ca-delete"
                      (click)="confirmDeleteId.set(cat._id)"
                      [disabled]="deletingId() === cat._id"
                      title="Eliminar">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                        <path d="M10,11v6"/><path d="M14,11v6"/>
                        <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                      </svg>
                    </button>
                  </div>

                  <!-- Children -->
                  @for (child of childrenOf(cat._id); track child._id) {
                    <div class="ca-item ca-item--child">
                      <div class="ca-item__row">
                        <span class="ca-item__connector">└</span>
                        <span class="ca-item__icon">{{ child.icon || '📄' }}</span>
                        <span class="ca-item__name">{{ child.name }}</span>
                        @if (child.order !== undefined) {
                          <span class="ca-item__order">#{{ child.order }}</span>
                        }
                        <button
                          class="ca-delete"
                          (click)="confirmDeleteId.set(child._id)"
                          [disabled]="deletingId() === child._id"
                          title="Eliminar">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                            <path d="M10,11v6"/><path d="M14,11v6"/>
                            <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Form panel -->
        <div class="ca-form-panel">
          <h3 class="ca-panel-title">Nueva categoría</h3>

          @if (createSuccess()) {
            <div class="ca-success-banner">
              ¡Categoría creada correctamente!
            </div>
          }

          @if (createError()) {
            <div class="ca-error-banner">{{ createError() }}</div>
          }

          <div class="form-group">
            <label class="form-label">Nombre *</label>
            <input
              class="form-input"
              type="text"
              [(ngModel)]="form().name"
              placeholder="Ej: Procesadores"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Categoría padre (opcional)</label>
            <select class="form-input" [(ngModel)]="form().parent">
              <option value="">Sin padre (categoría raíz)</option>
              @for (cat of rootCategories(); track cat._id) {
                <option [value]="cat._id">{{ cat.name }}</option>
              }
            </select>
            <span class="form-hint">Si seleccionás una categoría padre, esta será una subcategoría.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Ícono (emoji)</label>
            <input
              class="form-input ca-icon-input"
              type="text"
              [(ngModel)]="form().icon"
              placeholder="🖥️"
              maxlength="4"
            />
            <span class="form-hint">Usá un emoji como ícono visual.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Orden</label>
            <input
              class="form-input"
              type="number"
              min="0"
              [(ngModel)]="form().order"
              placeholder="0"
            />
            <span class="form-hint">Número para ordenar en el menú. Menor = primero.</span>
          </div>

          <button
            class="btn btn--primary btn--sm ca-submit"
            [disabled]="creating()"
            (click)="createCategory()">
            {{ creating() ? 'Creando...' : 'Crear categoría' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    @if (confirmDeleteId()) {
      <div class="modal-backdrop" (click)="confirmDeleteId.set(null)">
        <div class="modal-confirm" (click)="$event.stopPropagation()">
          <h3 class="modal-confirm__title">¿Eliminar categoría?</h3>
          <p class="modal-confirm__text">
            Los productos en esta categoría quedarán sin categoría. Esta acción no se puede deshacer.
          </p>
          <div class="modal-confirm__actions">
            <button class="btn btn--secondary btn--sm" (click)="confirmDeleteId.set(null)">Cancelar</button>
            <button
              class="btn btn--danger btn--sm"
              [disabled]="!!deletingId()"
              (click)="deleteCategory()">
              {{ deletingId() ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .ca-container {
      padding: var(--space-4) var(--space-4) var(--space-8);
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .ca-header {
      margin-bottom: var(--space-3);
    }

    .ca-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .ca-sub {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    .ca-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: var(--space-3);
      align-items: start;
    }

    .ca-panel-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: var(--space-2);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .ca-list-panel {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-3);
    }

    .ca-form-panel {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-3);
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-3));
    }

    .ca-skeleton {
      height: 44px;
      border-radius: var(--radius-md);
      background: #e5e7eb;
      margin-bottom: 8px;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .ca-empty {
      font-size: 13px;
      color: var(--color-text-secondary);
      padding: var(--space-2) 0;
    }

    .ca-tree {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .ca-item {
      border-radius: var(--radius-md);
    }

    .ca-item--child {
      padding-left: 12px;
    }

    .ca-item__row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: var(--radius-md);
      transition: background 150ms ease;
    }

    .ca-item__row:hover {
      background: rgba(0,0,0,0.04);
    }

    .ca-item__icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .ca-item__name {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .ca-item__order {
      font-size: 11px;
      color: var(--color-text-secondary);
      background: var(--color-border);
      padding: 1px 6px;
      border-radius: 100px;
    }

    .ca-item__connector {
      font-size: 12px;
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }

    .ca-delete {
      width: 26px;
      height: 26px;
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 150ms ease, color 150ms ease;
      opacity: 0;
    }

    .ca-item__row:hover .ca-delete {
      opacity: 1;
    }

    .ca-delete:hover {
      background: #FEE2E2;
      color: var(--color-error);
    }

    .ca-delete:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .ca-icon-input {
      font-size: 20px;
      width: 80px;
      text-align: center;
    }

    .ca-submit {
      width: 100%;
      justify-content: center;
      margin-top: var(--space-2);
    }

    .ca-success-banner {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #16A34A;
      border-radius: var(--radius-md);
      padding: 10px var(--space-2);
      font-size: 13px;
      margin-bottom: var(--space-2);
    }

    .ca-error-banner {
      background: #FFF5F5;
      border: 1px solid #FED7D7;
      color: var(--color-error);
      border-radius: var(--radius-md);
      padding: 10px var(--space-2);
      font-size: 13px;
      margin-bottom: var(--space-2);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

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

    @media (max-width: 768px) {
      .ca-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class CategoriesAdminComponent implements OnInit {
  private productSvc = inject(ProductService);

  categories = signal<(Category & { parent?: string; icon?: string; order?: number })[]>([]);
  loading = signal(true);
  creating = signal(false);
  deletingId = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);
  createError = signal<string | null>(null);
  createSuccess = signal(false);

  form = signal<CategoryForm>(emptyForm());

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.productSvc.getCategories().subscribe({
      next: res => {
        this.categories.set(res.categories as (Category & { parent?: string; icon?: string; order?: number })[]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  rootCategories() {
    return this.categories().filter(c => !c.parent);
  }

  childrenOf(parentId: string) {
    return this.categories().filter(c => c.parent === parentId);
  }

  createCategory() {
    const f = this.form();
    if (!f.name.trim()) {
      this.createError.set('El nombre es obligatorio.');
      return;
    }

    this.creating.set(true);
    this.createError.set(null);
    this.createSuccess.set(false);

    const data: { name: string; parent?: string; icon?: string; order?: number } = {
      name: f.name.trim()
    };
    if (f.parent) data.parent = f.parent;
    if (f.icon.trim()) data.icon = f.icon.trim();
    if (f.order !== null) data.order = f.order;

    this.productSvc.createCategory(data).subscribe({
      next: () => {
        this.creating.set(false);
        this.createSuccess.set(true);
        this.form.set(emptyForm());
        this.load();
        setTimeout(() => this.createSuccess.set(false), 3000);
      },
      error: err => {
        this.creating.set(false);
        this.createError.set(err?.error?.message || 'Error al crear categoría.');
      }
    });
  }

  deleteCategory() {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.deletingId.set(id);
    this.productSvc.deleteCategory(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
        this.load();
      },
      error: () => {
        this.deletingId.set(null);
        this.confirmDeleteId.set(null);
      }
    });
  }
}
