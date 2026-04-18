import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { AdminStats } from '../models/admin.model';
import { IdbService } from './idb.service';
import { SeedProduct } from '../data/seed-data';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private idb = inject(IdbService);

  getStats(): Observable<{ success: boolean; stats: AdminStats }> {
    return from((async () => {
      const [allProducts, allOrders, allUsers] = await Promise.all([
        this.idb.getAll<SeedProduct>('products'),
        this.idb.getAll<Order>('orders'),
        this.idb.getAll<{ _id: string }>('users'),
      ]);

      const activeProducts   = allProducts.filter(p => p.isActive !== false);
      const lowStockProducts = allProducts.filter(p => p.stock <= 5 && p.isActive !== false);

      const byStatus: Record<string, number> = {};
      let revenue = 0;
      for (const o of allOrders) {
        byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
        if (o.status === 'delivered') revenue += o.total;
      }

      const stats: AdminStats = {
        products: {
          total:    allProducts.length,
          active:   activeProducts.length,
          lowStock: lowStockProducts.length,
        },
        orders: {
          total:    allOrders.length,
          pending:  byStatus['pending'] ?? 0,
          revenue,
          byStatus,
        },
        users: {
          total: allUsers.length,
        },
      };

      return { success: true, stats };
    })());
  }
}
