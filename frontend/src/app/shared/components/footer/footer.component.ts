import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer__top">
        <div class="container">
          <div class="footer__grid">

            <!-- Marca -->
            <div class="footer__brand">
              <a routerLink="/" class="footer__logo">
                <div class="footer__logo-mark">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
                  </svg>
                </div>
                <span>PCParts</span>
              </a>
              <p class="footer__tagline">
                Hardware premium para tu próxima build. Componentes con garantía oficial y envío a todo el Perú.
              </p>
              <div class="footer__social">
                <a href="#" class="footer__social-btn" aria-label="Instagram" title="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                  </svg>
                </a>
                <a href="#" class="footer__social-btn" aria-label="Facebook" title="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="#" class="footer__social-btn" aria-label="TikTok" title="TikTok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                  </svg>
                </a>
                <a href="#" class="footer__social-btn" aria-label="WhatsApp" title="WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Links: Tienda -->
            <div class="footer__col">
              <h4 class="footer__col-title">Tienda</h4>
              <ul class="footer__links">
                <li><a routerLink="/catalog" class="footer__link">Catálogo completo</a></li>
                <li><a routerLink="/ofertas" class="footer__link">Ofertas</a></li>
                <li><a routerLink="/catalog/tarjetas-graficas" class="footer__link">Tarjetas Gráficas</a></li>
                <li><a routerLink="/catalog/procesadores" class="footer__link">Procesadores</a></li>
                <li><a routerLink="/catalog/memoria-ram" class="footer__link">Memoria RAM</a></li>
                <li><a routerLink="/catalog/almacenamiento" class="footer__link">Almacenamiento</a></li>
              </ul>
            </div>

            <!-- Links: Empresa -->
            <div class="footer__col">
              <h4 class="footer__col-title">Empresa</h4>
              <ul class="footer__links">
                <li><a routerLink="/nosotros" class="footer__link">Nosotros</a></li>
                <li><a href="#" class="footer__link">Contacto</a></li>
                <li><a href="#" class="footer__link">Blog técnico</a></li>
                <li><a href="#" class="footer__link">Trabaja con nosotros</a></li>
              </ul>
            </div>

            <!-- Links: Soporte -->
            <div class="footer__col">
              <h4 class="footer__col-title">Soporte</h4>
              <ul class="footer__links">
                <li><a routerLink="/orders" class="footer__link">Mis pedidos</a></li>
                <li><a href="#" class="footer__link">Política de devoluciones</a></li>
                <li><a href="#" class="footer__link">Garantías</a></li>
                <li><a href="#" class="footer__link">Preguntas frecuentes</a></li>
                <li><a href="#" class="footer__link">Guía de compatibilidad</a></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <!-- Barra de pagos + copyright -->
      <div class="footer__bottom">
        <div class="container">
          <div class="footer__bottom-inner">
            <p class="footer__copy">
              © {{ currentYear }} PCParts Peru. Todos los derechos reservados.
            </p>
            <div class="footer__payments">
              <span class="footer__pay-label">Métodos de pago</span>
              <div class="footer__pay-icons">
                <div class="footer__pay-chip">Visa</div>
                <div class="footer__pay-chip">Mastercard</div>
                <div class="footer__pay-chip">Yape</div>
                <div class="footer__pay-chip">Plin</div>
                <div class="footer__pay-chip">Transferencia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0A0A0F;
      color: rgba(255,255,255,0.6);
    }

    .footer__top {
      padding: 56px 0 48px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .footer__grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }

      @media (max-width: 560px) {
        grid-template-columns: 1fr;
        gap: 28px;
      }
    }

    /* Marca */
    .footer__brand {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .footer__logo {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }

    .footer__logo-mark {
      width: 28px;
      height: 28px;
      background: rgba(255,255,255,0.1);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }

    .footer__tagline {
      font-size: 13px;
      line-height: 1.65;
      color: rgba(255,255,255,0.4);
      max-width: 260px;
    }

    .footer__social {
      display: flex;
      gap: 8px;
    }

    .footer__social-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      transition: all 200ms ease;

      &:hover {
        background: rgba(255,255,255,0.12);
        color: #fff;
        transform: translateY(-2px);
      }
    }

    /* Columnas de links */
    .footer__col-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255,255,255,0.7);
      margin-bottom: 16px;
    }

    .footer__links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer__link {
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      text-decoration: none;
      transition: color 150ms ease;
      line-height: 1;

      &:hover { color: rgba(255,255,255,0.85); }
    }

    /* Bottom bar */
    .footer__bottom {
      padding: 18px 0;
    }

    .footer__bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .footer__copy {
      font-size: 12px;
      color: rgba(255,255,255,0.25);
    }

    .footer__payments {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .footer__pay-label {
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      font-weight: 500;
    }

    .footer__pay-icons {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .footer__pay-chip {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 5px;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 600;
      color: rgba(255,255,255,0.35);
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
