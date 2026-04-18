import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card">
      @for (item of items; track $index) {
        <div class="skeleton-card__item">
          <div class="skeleton-card__image shimmer"></div>
          <div class="skeleton-card__body">
            <div class="skeleton-card__brand shimmer"></div>
            <div class="skeleton-card__title shimmer"></div>
            <div class="skeleton-card__specs shimmer"></div>
            <div class="skeleton-card__footer">
              <div class="skeleton-card__price shimmer"></div>
              <div class="skeleton-card__btn shimmer"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-card {
      display: contents;
    }

    .skeleton-card__item {
      background: var(--color-white);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .skeleton-card__image {
      width: 100%;
      padding-bottom: 75%;
    }

    .skeleton-card__body {
      padding: var(--space-3);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .skeleton-card__brand  { height: 12px; width: 60px; }
    .skeleton-card__title  { height: 16px; width: 90%; }
    .skeleton-card__specs  { height: 12px; width: 70%; }

    .skeleton-card__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .skeleton-card__price { height: 22px; width: 80px; }
    .skeleton-card__btn   { height: 38px; width: 100px; border-radius: var(--radius-sm); }
  `]
})
export class SkeletonCardComponent {
  @Input() count = 8;
  get items() { return Array(this.count); }
}
