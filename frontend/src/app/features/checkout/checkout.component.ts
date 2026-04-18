import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { SavedAddress } from '../../core/models/auth.model';

type Step = 'identity' | 'shipping' | 'review';
type AddressMode = 'saved' | 'new';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="container checkout-container">

        <!-- Progreso -->
        <div class="checkout-steps">
          <div class="checkout-step" [class.active]="step() === 'identity'" [class.done]="stepIndex() > 0">
            <span class="checkout-step__num">1</span>
            <span class="checkout-step__label">Identificación</span>
          </div>
          <div class="checkout-step__line"></div>
          <div class="checkout-step" [class.active]="step() === 'shipping'" [class.done]="stepIndex() > 1">
            <span class="checkout-step__num">2</span>
            <span class="checkout-step__label">Envío</span>
          </div>
          <div class="checkout-step__line"></div>
          <div class="checkout-step" [class.active]="step() === 'review'">
            <span class="checkout-step__num">3</span>
            <span class="checkout-step__label">Revisión</span>
          </div>
        </div>

        <div class="checkout-layout">
          <div class="checkout-main">

            <!-- ── PASO 1: Identidad ── -->
            @if (step() === 'identity') {
              <div class="checkout-panel">
                <h2 class="checkout-panel__title">¿Cómo deseas continuar?</h2>
                <div class="checkout-identity__options">
                  <div class="identity-option identity-option--featured">
                    <div class="identity-option__header">
                      <h3>Continuar como invitado</h3>
                      <span class="badge badge--success">Más rápido</span>
                    </div>
                    <p class="text-secondary" style="font-size:13px;margin:8px 0 16px">Solo necesitamos tu email para la confirmación.</p>
                    <div class="form-group">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-input" [class.form-input--error]="emailError()"
                        placeholder="tu@email.com" [(ngModel)]="guestEmail" (input)="emailError.set('')" />
                      @if (emailError()) { <p class="form-error">{{ emailError() }}</p> }
                    </div>
                    <button class="btn btn--primary btn--lg btn--full" style="margin-top:var(--space-2)" (click)="continueAsGuest()">
                      Continuar como invitado
                    </button>
                  </div>
                  <div class="identity-option">
                    <h3>Iniciar sesión</h3>
                    <p class="text-secondary" style="font-size:13px;margin:8px 0 16px">Accede a tus direcciones guardadas y pedidos anteriores.</p>
                    <a routerLink="/auth/login" [queryParams]="{ redirect: '/checkout' }" class="btn btn--secondary btn--full">
                      Iniciar sesión
                    </a>
                  </div>
                </div>
              </div>
            }

            <!-- ── PASO 2: Envío ── -->
            @if (step() === 'shipping') {
              <div class="checkout-panel">

                @if (isLoggedIn()) {
                  <div class="checkout-user-banner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Comprando como <strong>{{ auth.user()?.name }}</strong>
                  </div>
                }

                <h2 class="checkout-panel__title">Dirección de envío</h2>

                <!-- Si el usuario tiene dirección guardada → selector -->
                @if (isLoggedIn() && hasSavedAddress()) {
                  <div class="address-selector">
                    <!-- Opción: usar guardada -->
                    <div class="address-option" [class.address-option--active]="addressMode() === 'saved'"
                         (click)="selectMode('saved')">
                      <div class="address-option__radio">
                        <div class="address-option__radio-dot"></div>
                      </div>
                      <div class="address-option__body">
                        <div class="address-option__header">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span class="address-option__label">Dirección guardada</span>
                        </div>
                        <p class="address-option__text">{{ auth.savedAddress()!.name }}</p>
                        <p class="address-option__text address-option__text--secondary">
                          {{ auth.savedAddress()!.address }}, {{ auth.savedAddress()!.city }}, {{ auth.savedAddress()!.country }}
                        </p>
                      </div>
                    </div>

                    <!-- Opción: nueva dirección -->
                    <div class="address-option" [class.address-option--active]="addressMode() === 'new'"
                         (click)="selectMode('new')">
                      <div class="address-option__radio">
                        <div class="address-option__radio-dot"></div>
                      </div>
                      <div class="address-option__body">
                        <span class="address-option__label">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Ingresar nueva dirección
                        </span>
                      </div>
                    </div>
                  </div>
                }

                <!-- Formulario de nueva dirección (siempre visible si no hay guardada o se eligió nueva) -->
                @if (!isLoggedIn() || !hasSavedAddress() || addressMode() === 'new') {
                  <div class="shipping-form" [style.margin-top]="hasSavedAddress() ? 'var(--space-3)' : '0'">
                    <div class="form-group">
                      <label class="form-label">Nombre completo del destinatario</label>
                      <input type="text" class="form-input" placeholder="Juan García" [(ngModel)]="shipping.name" />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Dirección</label>
                      <input type="text" class="form-input" placeholder="Av. Principal 123" [(ngModel)]="shipping.address" />
                    </div>
                    <div class="form-row">
                      <div class="form-group">
                        <label class="form-label">Ciudad</label>
                        <input type="text" class="form-input" placeholder="Lima" [(ngModel)]="shipping.city" />
                      </div>
                      <div class="form-group">
                        <label class="form-label">Código postal</label>
                        <input type="text" class="form-input" placeholder="15001" [(ngModel)]="shipping.zip" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="form-label">País</label>
                      <select class="form-input" [(ngModel)]="shipping.country">
                        <option value="Perú">Perú</option>
                        <option value="México">México</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Chile">Chile</option>
                      </select>
                    </div>

                    <!-- Guardar nueva dirección (solo usuarios logueados) -->
                    @if (isLoggedIn()) {
                      <label class="save-address-check">
                        <input type="checkbox" [(ngModel)]="saveNewAddress" />
                        <span>Guardar esta dirección para próximas compras</span>
                      </label>
                    }
                  </div>
                }

                <div class="checkout-panel__actions">
                  @if (!isLoggedIn()) {
                    <button class="btn btn--ghost" (click)="step.set('identity')">← Volver</button>
                  } @else {
                    <a routerLink="/cart" class="btn btn--ghost">← Volver al carrito</a>
                  }
                  <button class="btn btn--primary btn--lg" (click)="continueToReview()">Revisar orden →</button>
                </div>
              </div>
            }

            <!-- ── PASO 3: Revisión ── -->
            @if (step() === 'review') {
              <div class="checkout-panel">
                <h2 class="checkout-panel__title">Revisión de tu orden</h2>

                <div class="review-section">
                  <div class="review-section__header">
                    <span class="text-secondary" style="font-size:13px;font-weight:500">ENVÍO A</span>
                    <button class="btn btn--ghost btn--sm" (click)="step.set('shipping')">Editar</button>
                  </div>
                  <p style="font-size:14px">{{ resolvedShipping().name }} — {{ resolvedShipping().address }}, {{ resolvedShipping().city }}, {{ resolvedShipping().country }}</p>
                </div>

                <div class="review-items">
                  @for (item of cart.items(); track item.product._id) {
                    <div class="review-item">
                      <img [src]="item.product.images[0]" [alt]="item.product.name" class="review-item__img" />
                      <div class="review-item__info">
                        <p class="review-item__name">{{ item.product.name }}</p>
                        <p class="text-secondary" style="font-size:13px">Cantidad: {{ item.quantity }}</p>
                      </div>
                      <span class="price" style="font-size:15px">S/ {{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
                    </div>
                  }
                </div>

                <div class="checkout-panel__actions">
                  <button class="btn btn--ghost" (click)="step.set('shipping')">← Volver</button>
                  <button class="btn btn--primary btn--lg" [disabled]="submitting()" (click)="placeOrder()">
                    {{ submitting() ? 'Procesando...' : 'Confirmar pedido' }}
                  </button>
                </div>
              </div>
            }

          </div>

          <!-- Resumen lateral -->
          <aside class="checkout-summary">
            <h3 style="margin-bottom:var(--space-3)">Tu pedido</h3>
            @for (item of cart.items(); track item.product._id) {
              <div class="checkout-summary__item">
                <span class="checkout-summary__name">{{ item.product.name | slice:0:30 }}{{ item.product.name.length > 30 ? '…' : '' }} ×{{ item.quantity }}</span>
                <span>S/ {{ (item.product.price * item.quantity) | number:'1.0-0' }}</span>
              </div>
            }
            <div class="divider"></div>
            <div class="checkout-summary__item">
              <span class="text-secondary">Envío</span>
              <span>{{ cart.subtotal() >= 1000 ? 'Gratis' : 'S/ 15' }}</span>
            </div>
            <div class="checkout-summary__item checkout-summary__item--total">
              <span>Total</span>
              <span class="price">S/ {{ total() | number:'1.0-0' }}</span>
            </div>
          </aside>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .checkout-container { max-width: 900px; padding-top: var(--space-6); padding-bottom: var(--space-8); }

    .checkout-steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:var(--space-6); }

    .checkout-step {
      display:flex; align-items:center; gap:8px;
      &__num { width:28px; height:28px; border-radius:50%; border:2px solid var(--color-border); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:var(--color-text-secondary); transition:all var(--transition-fast); }
      &__label { font-size:var(--font-size-sm); color:var(--color-text-secondary); font-weight:500; }
      &__line { flex:1; height:1px; background:var(--color-border); margin:0 var(--space-2); min-width:40px; }
      &.active &__num { background:var(--color-black); border-color:var(--color-black); color:var(--color-white); }
      &.active &__label { color:var(--color-text-primary); font-weight:600; }
      &.done &__num { background:var(--color-success); border-color:var(--color-success); color:var(--color-white); }
    }

    .checkout-layout {
      display:grid; grid-template-columns:1fr 280px; gap:var(--space-6); align-items:start;
      @media (max-width:768px) { grid-template-columns:1fr; }
    }

    .checkout-panel { background:var(--color-surface); border-radius:var(--radius-xl); padding:var(--space-4); }
    .checkout-panel__title { font-size:var(--font-size-h2); font-weight:var(--font-weight-semibold); margin-bottom:var(--space-4); }
    .checkout-panel__actions { display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-4); }

    .checkout-user-banner { display:flex; align-items:center; gap:8px; background:#EFF6FF; border:1px solid #BFDBFE; border-radius:var(--radius-md); padding:10px 14px; font-size:13px; color:#1E40AF; margin-bottom:var(--space-3); }

    .checkout-identity__options { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3); @media (max-width:600px) { grid-template-columns:1fr; } }

    .identity-option {
      background:var(--color-white); border-radius:var(--radius-lg); padding:var(--space-3); border:1.5px solid var(--color-border);
      h3 { font-size:16px; font-weight:var(--font-weight-semibold); }
      &--featured { border-color:var(--color-black); }
    }

    .identity-option__header { display:flex; align-items:center; gap:var(--space-1); flex-wrap:wrap; }

    /* Address selector */
    .address-selector { display:flex; flex-direction:column; gap:var(--space-2); margin-bottom:4px; }

    .address-option {
      display:flex; align-items:flex-start; gap:12px;
      padding:var(--space-2) var(--space-3); border-radius:var(--radius-lg);
      border:1.5px solid var(--color-border); cursor:pointer;
      transition:border-color var(--transition-fast), background var(--transition-fast);
      &--active { border-color:var(--color-black); background:var(--color-surface); }
    }

    .address-option__radio {
      width:18px; height:18px; border-radius:50%; border:2px solid var(--color-border);
      display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px;
      transition:border-color var(--transition-fast);
      .address-option--active & { border-color:var(--color-black); }
    }

    .address-option__radio-dot {
      width:8px; height:8px; border-radius:50%; background:var(--color-black);
      opacity:0; transition:opacity var(--transition-fast);
      .address-option--active & { opacity:1; }
    }

    .address-option__header { display:flex; align-items:center; gap:6px; margin-bottom:4px; }

    .address-option__label { font-size:13px; font-weight:600; color:var(--color-text-primary); display:flex; align-items:center; gap:5px; }

    .address-option__body { flex:1; }

    .address-option__text {
      font-size:13px; color:var(--color-text-primary); line-height:1.5;
      &--secondary { color:var(--color-text-secondary); }
    }

    /* Save address checkbox */
    .save-address-check {
      display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px 12px;
      background:var(--color-white); border:1px solid var(--color-border);
      border-radius:var(--radius-md); font-size:13px; font-weight:500;
      color:var(--color-text-primary);
      input[type=checkbox] { width:16px; height:16px; cursor:pointer; accent-color:var(--color-black); }
    }

    .shipping-form { display:flex; flex-direction:column; gap:var(--space-2); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:var(--space-2); }

    .review-section {
      background:var(--color-white); border-radius:var(--radius-md); padding:var(--space-2); margin-bottom:var(--space-3);
      &__header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
    }

    .review-items { display:flex; flex-direction:column; gap:var(--space-1); }

    .review-item { display:flex; align-items:center; gap:var(--space-2); padding:10px; background:var(--color-white); border-radius:var(--radius-md); }
    .review-item__img { width:48px; height:48px; object-fit:contain; background:var(--color-surface); border-radius:var(--radius-sm); padding:4px; }
    .review-item__info { flex:1; }
    .review-item__name { font-size:var(--font-size-sm); font-weight:var(--font-weight-medium); }

    .checkout-summary { background:var(--color-surface); border-radius:var(--radius-xl); padding:var(--space-3); position:sticky; top:calc(var(--navbar-height) + var(--space-3)); }
    .checkout-summary__item { display:flex; justify-content:space-between; font-size:var(--font-size-sm); padding:6px 0; gap:var(--space-2); &--total { font-size:16px; font-weight:var(--font-weight-semibold); } }
    .checkout-summary__name { color:var(--color-text-secondary); flex:1; }
  `]
})
export class CheckoutComponent implements OnInit {
  cart    = inject(CartService);
  auth    = inject(AuthService);
  private orderService = inject(OrderService);
  private toast        = inject(ToastService);
  private router       = inject(Router);

  isLoggedIn    = this.auth.isLoggedIn;
  hasSavedAddress = () => !!this.auth.savedAddress();

  step         = signal<Step>('identity');
  stepIndex    = () => ['identity', 'shipping', 'review'].indexOf(this.step());
  submitting   = signal(false);
  emailError   = signal('');
  addressMode  = signal<AddressMode>('saved');
  saveNewAddress = false;

  guestEmail = '';
  shipping   = { name: '', address: '', city: '', zip: '', country: 'Perú' };

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.step.set('shipping');
      // Pre-seleccionar modo según si hay dirección guardada
      this.addressMode.set(this.hasSavedAddress() ? 'saved' : 'new');
    }
  }

  selectMode(mode: AddressMode): void {
    this.addressMode.set(mode);
  }

  /** Dirección que se usará en la orden */
  resolvedShipping(): { name: string; address: string; city: string; zip: string; country: string } {
    if (this.isLoggedIn() && this.hasSavedAddress() && this.addressMode() === 'saved') {
      const sa = this.auth.savedAddress()!;
      return { name: sa.name, address: sa.address, city: sa.city, zip: sa.zip, country: sa.country };
    }
    return this.shipping;
  }

  total(): number {
    const sub = this.cart.subtotal();
    return sub >= 1000 ? sub : sub + 15;
  }

  continueAsGuest(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.guestEmail)) { this.emailError.set('Ingresa un email válido'); return; }
    this.step.set('shipping');
  }

  continueToReview(): void {
    const resolved = this.resolvedShipping();
    if (!resolved.name || !resolved.address || !resolved.city || !resolved.zip || !resolved.country) {
      this.toast.show('Por favor completa todos los campos de envío', 'error');
      return;
    }

    // Si eligió nueva y quiere guardarla → persistir antes de continuar
    if (this.isLoggedIn() && this.addressMode() === 'new' && this.saveNewAddress) {
      this.auth.updateProfile({ savedAddress: { ...this.shipping } }).subscribe({
        next: () => this.toast.show('Dirección guardada correctamente', 'success'),
        error: () => {},
      });
    }

    this.step.set('review');
  }

  placeOrder(): void {
    if (this.submitting()) return;
    this.submitting.set(true);

    const resolved = this.resolvedShipping();
    const payload = {
      items:       this.cart.items().map(i => ({ product: i.product._id, quantity: i.quantity })),
      shipping:    resolved,
      guestEmail:  this.auth.isLoggedIn() ? undefined : this.guestEmail,
    };

    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.cart.clear();
        this.router.navigate(['/orders', res.order._id]);
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Error al procesar la orden', 'error');
        this.submitting.set(false);
      },
    });
  }
}
