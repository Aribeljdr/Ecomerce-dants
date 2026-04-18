import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">

      <!-- Hero -->
      <section class="about-hero">
        <div class="about-hero__bg">
          <div class="about-hero__glow"></div>
        </div>
        <div class="container">
          <div class="about-hero__content">
            <p class="about-hero__eyebrow">Nuestra historia</p>
            <h1 class="about-hero__title">Hardware premium,<br>trato cercano.</h1>
            <p class="about-hero__subtitle">
              Somos una empresa peruana especializada en componentes de computadora de alto rendimiento.
              Desde 2018, ayudamos a gamers, creadores y profesionales a construir sus equipos ideales.
            </p>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="section">
        <div class="container">
          <div class="stats-grid">
            @for (stat of stats; track stat.label) {
              <div class="stat-card">
                <span class="stat-card__number">{{ stat.value }}</span>
                <span class="stat-card__label">{{ stat.label }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Misión -->
      <section class="section section--surface">
        <div class="container">
          <div class="mission-layout">
            <div class="mission-text">
              <p class="section-eyebrow">Nuestra misión</p>
              <h2 class="mission-text__title">Democratizar el acceso al hardware de alto rendimiento</h2>
              <p class="mission-text__body">
                Creemos que cada persona merece acceso a componentes de calidad sin importar su nivel de experiencia.
                Por eso ofrecemos asesoría personalizada, garantías reales y los mejores precios del mercado peruano.
              </p>
              <p class="mission-text__body">
                Nuestro equipo de especialistas está disponible para guiarte en cada decisión de compra,
                desde una tarjeta gráfica de entrada hasta una workstation profesional.
              </p>
              <a routerLink="/catalog" class="btn btn--primary" style="margin-top: var(--space-3); width: fit-content;">
                Ver catálogo completo →
              </a>
            </div>

            <div class="mission-visual">
              <div class="mission-card mission-card--1">
                <div class="mission-card__icon">🚀</div>
                <h3>Velocidad de entrega</h3>
                <p>Despacho en 24-48 horas a Lima. Envío a todo el Perú.</p>
              </div>
              <div class="mission-card mission-card--2">
                <div class="mission-card__icon">🛡️</div>
                <h3>Garantía real</h3>
                <p>Todos nuestros productos tienen garantía oficial del fabricante.</p>
              </div>
              <div class="mission-card mission-card--3">
                <div class="mission-card__icon">💬</div>
                <h3>Soporte experto</h3>
                <p>Asesoría técnica personalizada para tu proyecto.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Valores -->
      <section class="section">
        <div class="container">
          <div class="section-header-center">
            <p class="section-eyebrow">Lo que nos define</p>
            <h2 class="section-title-center">Nuestros valores</h2>
          </div>
          <div class="values-grid">
            @for (val of values; track val.title) {
              <div class="value-card">
                <div class="value-card__icon-wrap">{{ val.icon }}</div>
                <h3 class="value-card__title">{{ val.title }}</h3>
                <p class="value-card__desc">{{ val.desc }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="section">
        <div class="container">
          <div class="about-cta">
            <h2 class="about-cta__title">¿Listo para armar tu PC ideal?</h2>
            <p class="about-cta__subtitle">Explora nuestro catálogo o contáctanos para asesoría personalizada.</p>
            <div class="about-cta__actions">
              <a routerLink="/catalog" class="btn btn--primary btn--lg">Explorar catálogo</a>
              <a routerLink="/ofertas" class="btn btn--secondary btn--lg">Ver ofertas</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    /* ── Hero ── */
    .about-hero {
      position: relative;
      background: #0A0A0F;
      overflow: hidden;
      padding: var(--space-8) 0;
      min-height: 380px;
      display: flex;
      align-items: center;
    }

    .about-hero__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .about-hero__glow {
      position: absolute;
      width: 600px; height: 400px;
      background: radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%);
      top: -100px; left: -100px;
    }

    .about-hero__content {
      position: relative;
      z-index: 1;
      max-width: 640px;
    }

    .about-hero__eyebrow {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.4);
      margin-bottom: var(--space-2);
    }

    .about-hero__title {
      font-size: clamp(36px, 5vw, 60px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin-bottom: var(--space-3);
    }

    .about-hero__subtitle {
      font-size: 17px;
      color: rgba(255,255,255,0.55);
      line-height: 1.65;
      max-width: 520px;
    }

    /* ── Stats ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-4) var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: center;
    }

    .stat-card__number {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .stat-card__label {
      font-size: 13px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    /* ── Misión ── */
    .section { padding: var(--space-8) 0; }
    .section--surface { background: var(--color-surface); }

    .section-eyebrow {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
    }

    .section-header-center {
      text-align: center;
      margin-bottom: var(--space-5);
    }

    .section-title-center {
      font-size: var(--font-size-h2);
      font-weight: var(--font-weight-semibold);
    }

    .mission-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
      align-items: start;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .mission-text__title {
      font-size: clamp(22px, 3vw, 32px);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: var(--space-3);
    }

    .mission-text__body {
      font-size: 15px;
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin-bottom: var(--space-2);
    }

    .mission-visual {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .mission-card {
      background: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast);

      &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        transform: translateY(-2px);
      }

      h3 {
        font-size: 15px;
        font-weight: var(--font-weight-semibold);
      }

      p {
        font-size: 13px;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }
    }

    .mission-card__icon {
      font-size: 28px;
    }

    /* ── Valores ── */
    .values-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .value-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      border: 1px solid transparent;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--color-border);
        background: var(--color-white);
        box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      }
    }

    .value-card__icon-wrap {
      font-size: 32px;
      line-height: 1;
    }

    .value-card__title {
      font-size: 17px;
      font-weight: var(--font-weight-semibold);
    }

    .value-card__desc {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    /* ── CTA final ── */
    .about-cta {
      background: var(--color-surface);
      border-radius: 20px;
      padding: var(--space-8);
      text-align: center;
    }

    .about-cta__title {
      font-size: clamp(24px, 3vw, 36px);
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: var(--space-2);
    }

    .about-cta__subtitle {
      font-size: 15px;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-4);
    }

    .about-cta__actions {
      display: flex;
      gap: var(--space-2);
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class NosotrosComponent {
  stats = [
    { value: '6+', label: 'Años en el mercado' },
    { value: '5K+', label: 'Clientes satisfechos' },
    { value: '500+', label: 'Productos en stock' },
    { value: '98%', label: 'Satisfacción de compra' },
  ];

  values = [
    {
      icon: '🎯',
      title: 'Calidad garantizada',
      desc: 'Trabajamos solo con distribuidores oficiales. Cada producto tiene garantía del fabricante y soporte post-venta.',
    },
    {
      icon: '⚡',
      title: 'Rapidez y eficiencia',
      desc: 'Despacho el mismo día en pedidos antes de las 2pm. Embalaje seguro para que tu componente llegue perfecto.',
    },
    {
      icon: '🤝',
      title: 'Asesoría honesta',
      desc: 'No te venderemos lo que no necesitas. Nuestros especialistas te guían para la mejor relación precio-rendimiento.',
    },
    {
      icon: '💰',
      title: 'Mejores precios',
      desc: 'Monitoremos el mercado constantemente. Si encuentras más barato en la competencia, te igualamos el precio.',
    },
    {
      icon: '🔒',
      title: 'Compra segura',
      desc: 'Pago seguro con múltiples métodos. Tu información personal está protegida con los más altos estándares.',
    },
    {
      icon: '🌎',
      title: 'Envío nacional',
      desc: 'Llegamos a todas las regiones del Perú. Con seguimiento en tiempo real de tu pedido.',
    },
  ];
}
