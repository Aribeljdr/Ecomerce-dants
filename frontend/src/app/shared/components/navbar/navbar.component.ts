import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar__inner container">

        <!-- Logo -->
        <a routerLink="/" class="navbar__logo">
          <div class="navbar__logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
            </svg>
          </div>
          <span>PCParts</span>
        </a>

        <!-- Links -->
        <ul class="navbar__links">

          <!-- Componentes mega-menu -->
          <li class="navbar__item navbar__item--mega"
              (mouseenter)="openMenu('components')"
              (mouseleave)="scheduleClose()">
            <span class="navbar__link navbar__link--has-arrow"
                  (click)="toggleMenu('components'); $event.stopPropagation()">
              Componentes
              <svg class="navbar__arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6,9 12,15 18,9"/>
              </svg>
            </span>

            @if (activeMenu() === 'components') {
              <div class="mega-menu"
                   (mouseenter)="cancelClose()"
                   (mouseleave)="scheduleClose()"
                   (click)="$event.stopPropagation()">
                <div class="mega-menu__body">

                  @if (categories().length === 0) {
                    <!-- Skeleton mientras carga -->
                    <div class="mega-menu__grid">
                      @for (n of [1,2,3,4]; track n) {
                        <div class="mega-menu__col">
                          <div class="mega-menu__heading">
                            <div class="mega-menu__heading-icon shimmer" style="background:#eee"></div>
                            <div class="shimmer" style="width:80px;height:12px;border-radius:4px;background:#eee"></div>
                          </div>
                          @for (m of [1,2,3]; track m) {
                            <div class="shimmer" style="height:30px;border-radius:6px;margin-bottom:2px;background:#eee"></div>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="mega-menu__grid" [style.grid-template-columns]="'repeat('+categories().length+',1fr)'">
                      @for (cat of categories(); track cat._id) {
                        <div class="mega-menu__col">
                          <div class="mega-menu__heading">
                            <div class="mega-menu__heading-icon">{{ cat.icon || '📦' }}</div>
                            <span>{{ cat.name }}</span>
                          </div>
                          <!-- Marcas de esta categoría -->
                          @for (brand of (brandsBySlug()[cat.slug] || []); track brand) {
                            <a [routerLink]="['/catalog', cat.slug]"
                               [queryParams]="{brands: brand}"
                               class="mega-menu__link"
                               (click)="closeMenu()">
                              <span>{{ brand }}</span>
                              <svg class="mml-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
                            </a>
                          }
                          @if (brandsLoading()) {
                            @for (m of [1,2]; track m) {
                              <div class="shimmer" style="height:28px;border-radius:6px;margin-bottom:2px;background:#eee"></div>
                            }
                          }
                          <a [routerLink]="['/catalog', cat.slug]" class="mega-menu__link mega-menu__link--all" (click)="closeMenu()">
                            Ver todos →
                          </a>
                        </div>
                      }
                    </div>
                  }

                  <div class="mega-menu__footer">
                    <a routerLink="/catalog" class="mega-menu__footer-link" (click)="closeMenu()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                      Ver todo el catálogo de componentes
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,18 15,12 9,6"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            }
          </li>

          <li class="navbar__item" (mouseenter)="closeMenu()">
            <a routerLink="/ofertas" class="navbar__link navbar__link--sale">
              <span class="sale-dot"></span>Ofertas
            </a>
          </li>

          <li class="navbar__item" (mouseenter)="closeMenu()">
            <a routerLink="/nosotros" class="navbar__link">Nosotros</a>
          </li>
        </ul>

        <!-- Acciones -->
        <div class="navbar__actions">

          <button class="navbar__icon-btn" aria-label="Buscar" title="Buscar productos">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          @if (auth.isLoggedIn()) {
            <!-- Perfil con dropdown -->
            <div class="profile-wrap" (click)="toggleProfile($event)">
              <button class="profile-btn" [class.profile-btn--active]="profileOpen()" aria-label="Mi perfil">
                <span class="profile-btn__avatar">{{ auth.user()?.name?.charAt(0)?.toUpperCase() }}</span>
              </button>

              @if (profileOpen()) {
                <div class="profile-dropdown" (click)="$event.stopPropagation()">
                  <!-- Cabecera -->
                  <div class="profile-dropdown__head">
                    <div class="profile-dropdown__avatar">{{ auth.user()?.name?.charAt(0)?.toUpperCase() }}</div>
                    <div class="profile-dropdown__info">
                      <p class="profile-dropdown__name">{{ auth.user()?.name }} {{ auth.user()?.lastName }}</p>
                      <p class="profile-dropdown__email">{{ auth.user()?.email }}</p>
                      @if (auth.user()?.role === 'admin') {
                        <span class="profile-dropdown__role">Admin</span>
                      }
                    </div>
                  </div>

                  <!-- Dirección con lápiz -->
                  <div class="profile-dropdown__address-row">
                    @if (auth.savedAddress()) {
                      <div class="profile-dropdown__address">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>{{ auth.savedAddress()!.city }}, {{ auth.savedAddress()!.country }}</span>
                      </div>
                    } @else {
                      <div class="profile-dropdown__address profile-dropdown__address--empty">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>Sin dirección guardada</span>
                      </div>
                    }
                    <a routerLink="/profile" class="profile-dropdown__edit-btn" (click)="profileOpen.set(false)" title="Editar perfil">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </a>
                  </div>

                  <div class="profile-dropdown__divider"></div>

                  <!-- Links -->
                  <a routerLink="/orders" class="profile-dropdown__item" (click)="profileOpen.set(false)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    Mis pedidos
                  </a>

                  @if (auth.isAdmin()) {
                    <a routerLink="/admin" class="profile-dropdown__item profile-dropdown__item--admin" (click)="profileOpen.set(false)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                      Panel de admin
                      <svg class="admin-pencil" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </a>
                  }

                  <div class="profile-dropdown__divider"></div>

                  <button class="profile-dropdown__item profile-dropdown__item--danger" (click)="onLogout()">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesión
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="navbar__icon-btn" aria-label="Iniciar sesión" title="Iniciar sesión">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </a>
          }

          <!-- Carrito -->
          <a routerLink="/cart" class="navbar__cart" [class.navbar__cart--has-items]="cart.count() > 0" aria-label="Ver carrito" title="Ver carrito">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            @if (cart.count() > 0) {
              <span class="navbar__cart-count">{{ cart.count() }}</span>
            }
          </a>

        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0;
      height: var(--navbar-height);
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      background: rgba(255,255,255,.92);
      border-bottom: 1px solid rgba(0,0,0,.06);
      z-index: 1000;
    }

    .navbar__inner {
      height: 100%; display: flex; align-items: center; gap: var(--space-3);
    }

    /* Logo */
    .navbar__logo {
      display: flex; align-items: center; gap: 8px;
      font-size: 17px; font-weight: var(--font-weight-bold);
      color: var(--color-text-primary); white-space: nowrap;
      text-decoration: none; flex-shrink: 0; letter-spacing: -.02em;
    }

    .navbar__logo-mark {
      width: 30px; height: 30px; background: var(--color-black);
      border-radius: 8px; display: flex; align-items: center;
      justify-content: center; color: #fff; flex-shrink: 0;
    }

    /* Links */
    .navbar__links {
      display: flex; list-style: none; gap: 2px; flex: 1;
      @media (max-width: 768px) { display: none; }
    }

    .navbar__item { position: relative; }

    .navbar__link {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 12px; font-size: 14px; font-weight: var(--font-weight-medium);
      color: var(--color-text-primary); border-radius: var(--radius-sm);
      cursor: pointer; transition: background var(--transition-fast);
      white-space: nowrap; text-decoration: none; user-select: none;
      &:hover { background: var(--color-surface); }
      &--sale { color: #DC2626; font-weight: 600; }
    }

    .navbar__arrow {
      opacity: .4; transition: transform 200ms ease, opacity 200ms ease;
    }

    .navbar__item--mega:hover .navbar__arrow { transform: rotate(180deg); opacity: .8; }

    .sale-dot {
      width: 6px; height: 6px; background: #DC2626;
      border-radius: 50%; animation: pulse-sale 2s infinite;
    }

    @keyframes pulse-sale {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:.5; transform:scale(.75); }
    }

    /* Mega-menu */
    .mega-menu {
      position: absolute; top: 100%; left: -16px; z-index: 200;
      padding-top: 6px;
      filter: drop-shadow(0 12px 40px rgba(0,0,0,.13));
    }

    .mega-menu__body {
      background: #fff; border: 1px solid rgba(0,0,0,.07);
      border-radius: 16px; overflow: hidden;
      animation: megaFadeDown 160ms cubic-bezier(.2,.8,.4,1);
      min-width: 700px;
    }

    .mega-menu__grid {
      display: grid; grid-template-columns: repeat(4,1fr);
      padding: var(--space-3); gap: 0;
    }

    .mega-menu__col {
      display: flex; flex-direction: column; gap: 2px;
      padding: 4px var(--space-2);
      &:not(:last-child) { border-right: 1px solid var(--color-border); }
      &:not(:first-child) { padding-left: var(--space-2); }
    }

    .mega-menu__heading {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
    }

    .mega-menu__heading-icon {
      width: 28px; height: 28px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }

    .mega-menu__heading > span {
      font-size: 11px; font-weight: 700; color: var(--color-text-primary);
      text-transform: uppercase; letter-spacing: .07em;
    }

    .mega-menu__link {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 13px; color: var(--color-text-secondary);
      padding: 7px 8px; border-radius: 8px; text-decoration: none;
      transition: background 150ms ease, color 150ms ease;
      .mml-arrow { opacity:0; transform:translateX(-3px); transition: opacity 150ms, transform 150ms; flex-shrink:0; }
      &:hover { background: var(--color-surface); color: var(--color-text-primary); .mml-arrow { opacity:.6; transform:translateX(0); } }
      &--all { font-size:11px; font-weight:600; color:var(--color-text-secondary); margin-top:4px; justify-content:flex-start; &:hover { color:var(--color-text-primary); background:transparent; } }
    }

    .mega-menu__footer {
      background: var(--color-surface); border-top: 1px solid var(--color-border);
      padding: 12px var(--space-4);
    }

    .mega-menu__footer-link {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600; color: var(--color-text-primary);
      text-decoration: none; transition: gap 200ms ease;
      &:hover { gap: 12px; }
      svg:last-child { opacity:.4; }
    }

    /* Acciones */
    .navbar__actions {
      display: flex; align-items: center; gap: 2px;
      margin-left: auto; flex-shrink: 0;
    }

    .navbar__icon-btn {
      position: relative; display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: var(--radius-sm);
      background: transparent; border: none; cursor: pointer;
      color: var(--color-text-primary); transition: background var(--transition-fast);
      text-decoration: none;
      &:hover { background: var(--color-surface); }
      &::after {
        content: attr(title); position: absolute; top: calc(100% + 6px); left: 50%;
        transform: translateX(-50%); background: var(--color-black); color: #fff;
        font-size: 11px; font-weight: 500; white-space: nowrap; padding: 4px 8px;
        border-radius: 5px; pointer-events: none; opacity: 0;
        transition: opacity 150ms ease; z-index: 100;
      }
      &:hover::after { opacity: 1; }
    }

    /* ── Perfil ── */
    .profile-wrap {
      position: relative; flex-shrink: 0;
    }

    .profile-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 50%; border: none;
      cursor: pointer; padding: 0; background: transparent;
      transition: transform 150ms ease;
      &:hover { transform: scale(1.05); }
      &--active { ring: 2px solid var(--color-black); }
    }

    .profile-btn__avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      color: #fff; font-size: 14px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      letter-spacing: 0; user-select: none;
      box-shadow: 0 2px 8px rgba(102,126,234,.4);
    }

    /* Dropdown de perfil */
    .profile-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: #fff; border: 1px solid rgba(0,0,0,.07);
      border-radius: 14px; width: 240px; overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,.14);
      animation: megaFadeDown 160ms cubic-bezier(.2,.8,.4,1);
      z-index: 500;
    }

    .profile-dropdown__head {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px;
    }

    .profile-dropdown__avatar {
      width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      color: #fff; font-size: 17px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    .profile-dropdown__info { flex: 1; min-width: 0; }

    .profile-dropdown__name {
      font-size: 14px; font-weight: 600; color: var(--color-text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .profile-dropdown__email {
      font-size: 12px; color: var(--color-text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-top: 1px;
    }

    .profile-dropdown__role {
      display: inline-block; margin-top: 3px;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      background: #EDE9FE; color: #7C3AED; border-radius: 4px;
      padding: 1px 6px; letter-spacing: .05em;
    }

    .profile-dropdown--editing { width: 300px; }

    .profile-dropdown__address-row {
      display: flex; align-items: center; gap: 6px;
      margin: 0 16px 10px;
    }

    .profile-dropdown__address {
      display: flex; align-items: center; gap: 6px; flex: 1;
      padding: 7px 10px;
      background: #F0FDF4; border-radius: 8px;
      font-size: 12px; color: #166534;
      svg { flex-shrink: 0; color: #16A34A; }
      &--empty { background: var(--color-surface); color: var(--color-text-secondary); svg { color: var(--color-text-secondary); } }
    }

    .profile-dropdown__edit-btn {
      flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--color-border);
      background: #fff; cursor: pointer; color: var(--color-text-secondary);
      transition: background 150ms, color 150ms, border-color 150ms;
      &:hover { background: var(--color-surface); color: var(--color-text-primary); border-color: #bbb; }
    }

    .admin-pencil {
      margin-left: auto; opacity: .4;
    }
    .profile-dropdown__item--admin:hover .admin-pencil { opacity: .8; }

    .profile-dropdown__divider {
      height: 1px; background: var(--color-border); margin: 4px 0;
    }

    .profile-dropdown__item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 16px; font-size: 13px; font-weight: 500;
      color: var(--color-text-primary); text-decoration: none;
      background: transparent; border: none; cursor: pointer; width: 100%;
      text-align: left; transition: background 150ms ease;
      svg { opacity: .5; flex-shrink: 0; }
      &:hover { background: var(--color-surface); svg { opacity: 1; } }
      &--admin { color: #7C3AED; svg { color: #7C3AED; opacity: .7; } &:hover { background: #F5F3FF; } }
      &--danger { color: #DC2626; svg { color: #DC2626; opacity: .7; } &:hover { background: #FEF2F2; } }
    }

    /* Carrito */
    .navbar__cart {
      position: relative; display: flex; align-items: center; justify-content: center;
      gap: 6px; height: 36px; padding: 0 13px; border-radius: 9px;
      background: var(--color-black); cursor: pointer; color: #fff;
      transition: background 200ms ease, transform 150ms ease;
      text-decoration: none; font-size: 13px; font-weight: 600;
      white-space: nowrap; margin-left: 4px;
      &:hover { background: #222; transform: translateY(-1px); }
      &:active { transform: translateY(0); }
      &::after {
        content: attr(title); position: absolute; top: calc(100% + 6px); left: 50%;
        transform: translateX(-50%); background: var(--color-black); color: #fff;
        font-size: 11px; padding: 4px 8px; border-radius: 5px;
        pointer-events: none; opacity: 0; transition: opacity 150ms ease; z-index: 100;
        white-space: nowrap;
      }
      &:hover::after { opacity: 0; }
    }

    .navbar__cart-count {
      background: rgba(255,255,255,.2); color: #fff; font-size: 11px; font-weight: 700;
      min-width: 18px; height: 18px; border-radius: 100px;
      display: flex; align-items: center; justify-content: center; padding: 0 4px;
    }

    @keyframes megaFadeDown {
      from { opacity:0; transform:translateY(-10px) scale(.98); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
  `]
})
export class NavbarComponent implements OnInit {
  cart        = inject(CartService);
  auth        = inject(AuthService);
  productSvc  = inject(ProductService);

  activeMenu    = signal<string | null>(null);
  profileOpen   = signal(false);
  categories    = signal<Category[]>([]);
  brandsBySlug  = signal<Record<string, string[]>>({});
  brandsLoaded  = signal(false);
  brandsLoading = signal(false);

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.productSvc.getCategories().subscribe(res => {
      // Solo categorías raíz (sin parent)
      this.categories.set(res.categories.filter((c: Category & { parent?: string }) => !c.parent));
    });
  }

  private loadBrands(): void {
    if (this.brandsLoaded() || this.brandsLoading()) return;
    this.brandsLoading.set(true);

    const cats = this.categories();
    if (!cats.length) { this.brandsLoading.set(false); return; }

    const calls = cats.map(cat => this.productSvc.getBrands(cat.slug));
    forkJoin(calls).subscribe({
      next: results => {
        const map: Record<string, string[]> = {};
        cats.forEach((cat, i) => { map[cat.slug] = results[i].brands.slice(0, 4); });
        this.brandsBySlug.set(map);
        this.brandsLoaded.set(true);
        this.brandsLoading.set(false);
      },
      error: () => this.brandsLoading.set(false),
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.profileOpen.set(false);
    this.activeMenu.set(null);
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen.update(v => !v);
  }

  onLogout(): void {
    this.profileOpen.set(false);
    this.auth.logout();
  }

  openMenu(name: string): void {
    this.cancelClose();
    this.activeMenu.set(name);
    if (name === 'components') this.loadBrands();
  }

  toggleMenu(name: string): void {
    this.cancelClose();
    this.activeMenu.update(cur => cur === name ? null : name);
    if (this.activeMenu() === 'components') this.loadBrands();
  }

  scheduleClose(): void { this.closeTimer = setTimeout(() => this.activeMenu.set(null), 200); }
  cancelClose(): void { if (this.closeTimer) { clearTimeout(this.closeTimer); this.closeTimer = null; } }
  closeMenu(): void { this.cancelClose(); this.activeMenu.set(null); }
}
