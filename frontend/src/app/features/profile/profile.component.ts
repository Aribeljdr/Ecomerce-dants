import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="container profile-container">

        <!-- Header -->
        <div class="profile-header">
          <div class="profile-header__top">
            <button class="back-btn" (click)="location.back()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15,18 9,12 15,6"/></svg>
              Volver
            </button>
          </div>
          <h1 class="profile-header__title">Mi perfil</h1>
          <p class="profile-header__sub text-secondary">Administra tu información personal y dirección de entrega</p>
        </div>

        <!-- Identity banner -->
        <div class="identity-banner">
          <div class="identity-banner__avatar">
            {{ auth.user()?.name?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="identity-banner__info">
            <p class="identity-banner__name">
              {{ form().name || auth.user()?.name }}
              @if (form().lastName) { {{ form().lastName }} }
            </p>
            <p class="identity-banner__email text-secondary">{{ auth.user()?.email }}</p>
            @if (auth.user()?.dni) {
              <p class="identity-banner__dni text-secondary">DNI: {{ auth.user()?.dni }}</p>
            }
          </div>
          @if (auth.user()?.role === 'admin') {
            <span class="identity-banner__badge">Admin</span>
          }
        </div>

        <!-- Sección: Datos personales -->
        <section class="profile-section">
          <div class="profile-section__header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <h2 class="profile-section__title">Datos personales</h2>
          </div>

          <div class="profile-panel">
            <div class="fields-grid">
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <input class="form-input" type="text"
                  [value]="form().name"
                  (input)="set('name', $any($event.target).value)"
                  placeholder="Tu nombre" />
              </div>
              <div class="form-group">
                <label class="form-label">Apellido</label>
                <input class="form-input" type="text"
                  [value]="form().lastName"
                  (input)="set('lastName', $any($event.target).value)"
                  placeholder="Tu apellido" />
              </div>
              <div class="form-group">
                <label class="form-label">DNI</label>
                <input class="form-input" type="text"
                  [value]="form().dni"
                  (input)="set('dni', $any($event.target).value)"
                  placeholder="12345678" />
              </div>
              <div class="form-group">
                <label class="form-label">Correo electrónico</label>
                <input class="form-input form-input--disabled" type="email"
                  [value]="form().email"
                  disabled />
                <span class="form-hint">El correo no puede modificarse</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Sección: Dirección -->
        <section class="profile-section">
          <div class="profile-section__header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <h2 class="profile-section__title">Dirección de entrega</h2>
          </div>

          <div class="profile-panel">
            <div class="fields-grid">
              <div class="form-group fields-grid__full">
                <label class="form-label">Calle y número</label>
                <input class="form-input" type="text"
                  [value]="form().address"
                  (input)="set('address', $any($event.target).value)"
                  placeholder="Av. Ejemplo 1234, Dpto 5" />
              </div>
              <div class="form-group">
                <label class="form-label">Ciudad</label>
                <input class="form-input" type="text"
                  [value]="form().city"
                  (input)="set('city', $any($event.target).value)"
                  placeholder="Lima" />
              </div>
              <div class="form-group">
                <label class="form-label">Código postal</label>
                <input class="form-input" type="text"
                  [value]="form().zip"
                  (input)="set('zip', $any($event.target).value)"
                  placeholder="15001" />
              </div>
              <div class="form-group fields-grid__full">
                <label class="form-label">País</label>
                <input class="form-input" type="text"
                  [value]="form().country"
                  (input)="set('country', $any($event.target).value)"
                  placeholder="Perú" />
              </div>
            </div>
          </div>
        </section>

        <!-- Footer acciones -->
        <div class="profile-footer">
          <div class="profile-footer__feedback">
            @if (saveError()) {
              <span class="profile-footer__error">{{ saveError() }}</span>
            }
            @if (saved()) {
              <span class="profile-footer__success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                Cambios guardados
              </span>
            }
          </div>
          <button class="btn btn--primary" (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 760px;
      padding-top: var(--space-6);
      padding-bottom: var(--space-8);
    }

    /* ── Header ── */
    .profile-header {
      margin-bottom: var(--space-4);
    }

    .profile-header__top {
      margin-bottom: var(--space-3);
    }

    .back-btn {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary); background: none; border: none;
      cursor: pointer; padding: 0; transition: color var(--transition-fast);
      &:hover { color: var(--color-text-primary); }
    }

    .profile-header__title {
      font-size: clamp(24px, 3vw, 32px);
      font-weight: var(--font-weight-bold);
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }

    .profile-header__sub {
      font-size: var(--font-size-sm);
    }

    /* ── Identity banner ── */
    .identity-banner {
      display: flex; align-items: center; gap: var(--space-3);
      background: var(--color-surface); border-radius: var(--radius-xl);
      padding: var(--space-3) var(--space-4);
      margin-bottom: var(--space-4);
    }

    .identity-banner__avatar {
      width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      color: #fff; font-size: 22px; font-weight: var(--font-weight-bold);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(102,126,234,.3);
    }

    .identity-banner__info {
      flex: 1; min-width: 0;
    }

    .identity-banner__name {
      font-size: 16px; font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary); margin-bottom: 2px;
    }

    .identity-banner__email {
      font-size: var(--font-size-sm); margin-bottom: 1px;
    }

    .identity-banner__dni {
      font-size: var(--font-size-label);
    }

    .identity-banner__badge {
      flex-shrink: 0;
      font-size: 11px; font-weight: var(--font-weight-bold);
      text-transform: uppercase; letter-spacing: .06em;
      background: #EDE9FE; color: #7C3AED;
      border-radius: var(--radius-sm); padding: 3px 10px;
    }

    /* ── Sección ── */
    .profile-section {
      margin-bottom: var(--space-4);
    }

    .profile-section__header {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: var(--space-2);
      svg { color: var(--color-text-secondary); }
    }

    .profile-section__title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .profile-panel {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
    }

    /* ── Fields grid ── */
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);

      &__full { grid-column: 1 / -1; }
    }

    /* ── Disabled input override ── */
    .form-input--disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    /* ── Footer ── */
    .profile-footer {
      display: flex; align-items: center; justify-content: flex-end;
      gap: var(--space-3); padding-top: var(--space-1);
    }

    .profile-footer__feedback {
      flex: 1;
    }

    .profile-footer__error {
      font-size: var(--font-size-label); color: var(--color-error);
    }

    .profile-footer__success {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: var(--font-size-label); color: #16A34A;
      svg { flex-shrink: 0; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  auth     = inject(AuthService);
  location = inject(Location);

  saving    = signal(false);
  saved     = signal(false);
  saveError = signal('');

  form = signal({
    name: '', lastName: '', dni: '', email: '',
    address: '', city: '', zip: '', country: ''
  });

  ngOnInit(): void {
    const u = this.auth.user();
    const a = this.auth.savedAddress();
    this.form.set({
      name:     u?.name     ?? '',
      lastName: u?.lastName ?? '',
      dni:      u?.dni      ?? '',
      email:    u?.email    ?? '',
      address:  a?.address  ?? '',
      city:     a?.city     ?? '',
      zip:      a?.zip      ?? '',
      country:  a?.country  ?? '',
    });
  }

  set(field: string, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
    this.saved.set(false);
  }

  save(): void {
    this.saving.set(true);
    this.saveError.set('');
    this.saved.set(false);

    const f = this.form();
    const hasAddress = f.address || f.city || f.zip || f.country;
    const savedAddress = hasAddress
      ? { name: `${f.name} ${f.lastName}`.trim(), address: f.address, city: f.city, zip: f.zip, country: f.country }
      : null;

    this.auth.updateProfile({ name: f.name, lastName: f.lastName, dni: f.dni, savedAddress }).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('Error al guardar. Intenta de nuevo.');
      }
    });
  }
}
