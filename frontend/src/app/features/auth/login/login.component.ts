import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="container auth-container">
        <div class="auth-card">
          <h1 class="auth-card__title">Bienvenido</h1>
          <p class="text-secondary auth-card__subtitle">Inicia sesión en tu cuenta</p>

          <form class="auth-form" (ngSubmit)="login()">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" placeholder="tu@email.com" [(ngModel)]="email" name="email" required />
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input type="password" class="form-input" placeholder="••••••••" [(ngModel)]="password" name="password" required />
            </div>

            @if (error()) {
              <p class="form-error">{{ error() }}</p>
            }

            <button type="submit" class="btn btn--primary btn--lg btn--full" [disabled]="loading()">
              {{ loading() ? 'Ingresando...' : 'Iniciar sesión' }}
            </button>
          </form>

          <p class="auth-card__footer text-secondary">
            ¿No tienes cuenta? <a routerLink="/auth/register" style="color: var(--color-text-primary); font-weight: 500;">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      max-width: 400px;
      padding-top: var(--space-8);
      padding-bottom: var(--space-8);
    }

    .auth-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
    }

    .auth-card__title {
      font-size: 28px;
      font-weight: var(--font-weight-bold);
      margin-bottom: 6px;
    }

    .auth-card__subtitle {
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-4);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .auth-card__footer {
      text-align: center;
      font-size: var(--font-size-sm);
      margin-top: var(--space-3);
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  login(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.show('¡Bienvenido de vuelta!', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Credenciales incorrectas');
        this.loading.set(false);
      },
    });
  }
}
