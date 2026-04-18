import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Order, OrderItem, CreateOrderPayload } from '../models/order.model';
import { IdbService } from './idb.service';
import { AuthService } from './auth.service';
import { SeedProduct } from '../data/seed-data';

interface IdbOrder extends Order {
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private idb  = inject(IdbService);
  private auth = inject(AuthService);

  createOrder(payload: CreateOrderPayload): Observable<{ success: boolean; order: Order }> {
    return from((async () => {
      const resolvedItems: OrderItem[] = [];
      let subtotal = 0;

      for (const item of payload.items) {
        const product = await this.idb.getById<SeedProduct>('products', item.product);
        if (!product) throw new Error(`Producto no encontrado: ${item.product}`);
        if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`);

        resolvedItems.push({
          product:  product._id,
          name:     product.name,
          price:    product.price,
          quantity: item.quantity,
          image:    product.images[0] ?? '',
        });
        subtotal += product.price * item.quantity;

        await this.idb.put('products', { ...product, stock: product.stock - item.quantity });
      }

      const shippingCost = subtotal >= 5000 ? 0 : 500;
      const total        = subtotal + shippingCost;
      const userId       = this.auth.user()?.id;

      const newOrder: IdbOrder = {
        _id:          crypto.randomUUID(),
        user:         userId,
        userId:       userId,
        guestEmail:   payload.guestEmail,
        items:        resolvedItems,
        shipping:     payload.shipping,
        payment:      { method: payload.payment?.method ?? 'credit_card', status: 'pending' },
        status:       'pending',
        subtotal,
        shippingCost,
        total,
        createdAt:    new Date().toISOString(),
      };
      await this.idb.put('orders', newOrder);
      return { success: true, order: this.toOrder(newOrder) };
    })());
  }

  getMyOrders(): Observable<{ success: boolean; orders: Order[] }> {
    return from((async () => {
      const userId = this.auth.user()?.id;
      if (!userId) return { success: true, orders: [] };

      const orders = await this.idb.getAllByIndex<IdbOrder>('orders', 'userId', userId);
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { success: true, orders: orders.map(o => this.toOrder(o)) };
    })());
  }

  getOrderById(id: string): Observable<{ success: boolean; order: Order }> {
    return from((async () => {
      const o = await this.idb.getById<IdbOrder>('orders', id);
      if (!o) throw new Error('Orden no encontrada');
      return { success: true, order: this.toOrder(o) };
    })());
  }

  getAllOrders(filters: { status?: string; page?: number; limit?: number } = {}): Observable<{ success: boolean; total: number; pages: number; orders: Order[] }> {
    return from((async () => {
      let orders = filters.status
        ? await this.idb.getAllByIndex<IdbOrder>('orders', 'status', filters.status)
        : await this.idb.getAll<IdbOrder>('orders');

      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = orders.length;
      const limit = filters.limit ?? 20;
      const page  = filters.page  ?? 1;
      const pages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const sliced = orders.slice(start, start + limit);

      const enriched = await Promise.all(sliced.map(async o => {
        const order = this.toOrder(o) as any;
        if (o.userId) {
          const user = await this.idb.getById<{ name: string; email: string }>('users', o.userId);
          if (user) order.user = { name: user.name, email: user.email };
        }
        return order as Order;
      }));

      return { success: true, total, pages, orders: enriched };
    })());
  }

  updateOrderStatus(id: string, status: string): Observable<{ success: boolean; order: Order }> {
    return from((async () => {
      const order = await this.idb.getById<IdbOrder>('orders', id);
      if (!order) throw new Error('Orden no encontrada');
      const updated: IdbOrder = { ...order, status: status as Order['status'] };
      await this.idb.put('orders', updated);
      return { success: true, order: this.toOrder(updated) };
    })());
  }

  private toOrder(o: IdbOrder): Order {
    const { userId, ...order } = o;
    return order as Order;
  }
}
