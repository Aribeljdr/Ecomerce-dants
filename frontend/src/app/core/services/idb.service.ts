import { Injectable } from '@angular/core';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_USERS, SeedProduct } from '../data/seed-data';
import { ProductFilters } from '../models/product.model';

const DB_NAME    = 'pcparts-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      localStorage.removeItem('idb_seeded');

      const catStore = db.createObjectStore('categories', { keyPath: '_id' });
      catStore.createIndex('slug', 'slug', { unique: true });

      const prodStore = db.createObjectStore('products', { keyPath: '_id' });
      prodStore.createIndex('slug',         'slug',         { unique: true  });
      prodStore.createIndex('categorySlug', 'categorySlug', { unique: false });
      prodStore.createIndex('brand',        'brand',        { unique: false });
      prodStore.createIndex('isActive',     'isActive',     { unique: false });

      const userStore = db.createObjectStore('users', { keyPath: '_id' });
      userStore.createIndex('email', 'email', { unique: true });

      const orderStore = db.createObjectStore('orders', { keyPath: '_id' });
      orderStore.createIndex('userId',     'userId',     { unique: false });
      orderStore.createIndex('guestEmail', 'guestEmail', { unique: false });
      orderStore.createIndex('status',     'status',     { unique: false });
    };

    req.onsuccess = async () => {
      const db = req.result;
      if (localStorage.getItem('idb_seeded') !== 'true') {
        try {
          await seedDatabase(db);
          localStorage.setItem('idb_seeded', 'true');
        } catch (e) {
          console.error('IDB seed error:', e);
        }
      }
      resolve(db);
    };

    req.onerror = () => reject(req.error);
  });
}

function seedDatabase(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['categories', 'products', 'users'], 'readwrite');
    const catStore  = tx.objectStore('categories');
    const prodStore = tx.objectStore('products');
    const userStore = tx.objectStore('users');

    SEED_CATEGORIES.forEach(c => catStore.put(c));
    SEED_PRODUCTS.forEach(p => prodStore.put(p));
    SEED_USERS.forEach(u => userStore.put(u));

    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) dbPromise = openDatabase();
  return dbPromise;
}

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

@Injectable({ providedIn: 'root' })
export class IdbService {

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await getDb();
    const tx  = db.transaction(storeName, 'readonly');
    return idbRequest<T[]>(tx.objectStore(storeName).getAll());
  }

  async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await getDb();
    const tx  = db.transaction(storeName, 'readonly');
    return idbRequest<T | undefined>(tx.objectStore(storeName).get(id));
  }

  async getByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T | undefined> {
    const db = await getDb();
    const tx  = db.transaction(storeName, 'readonly');
    return idbRequest<T | undefined>(tx.objectStore(storeName).index(indexName).get(value));
  }

  async getAllByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    const db = await getDb();
    const tx  = db.transaction(storeName, 'readonly');
    return idbRequest<T[]>(tx.objectStore(storeName).index(indexName).getAll(value));
  }

  async put<T>(storeName: string, record: T): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async putMany<T>(storeName: string, records: T[]): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      records.forEach(r => store.put(r));
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  }

  async count(storeName: string): Promise<number> {
    const db = await getDb();
    const tx  = db.transaction(storeName, 'readonly');
    return idbRequest<number>(tx.objectStore(storeName).count());
  }

  async getProductsFiltered(filters: ProductFilters): Promise<SeedProduct[]> {
    const db = await getDb();

    return new Promise((resolve, reject) => {
      const tx    = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');

      let cursorReq: IDBRequest<IDBCursorWithValue | null>;
      if (filters.category) {
        cursorReq = store.index('categorySlug').openCursor(IDBKeyRange.only(filters.category));
      } else {
        cursorReq = store.openCursor();
      }

      const results: SeedProduct[] = [];
      const searchQ = filters.search?.toLowerCase();
      const brand   = filters.brand;
      const minP    = filters.minPrice;
      const maxP    = filters.maxPrice;
      const showAll = (filters as any)['showAll'] === true;

      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (!cursor) { resolve(results); return; }

        const p = cursor.value as SeedProduct;
        let match = showAll ? true : p.isActive !== false;

        if (match && brand   && p.brand !== brand)       match = false;
        if (match && minP    !== undefined && p.price < minP)  match = false;
        if (match && maxP    !== undefined && p.price > maxP)  match = false;
        if (match && filters.featured !== undefined && p.featured !== filters.featured) match = false;
        if (match && searchQ) {
          const inName = p.name.toLowerCase().includes(searchQ);
          const inDesc = p.description.toLowerCase().includes(searchQ);
          const inTags = p.tags.some(t => t.includes(searchQ));
          if (!inName && !inDesc && !inTags) match = false;
        }

        if (match) results.push(p);
        cursor.continue();
      };

      cursorReq.onerror = () => reject(cursorReq.error);
    });
  }
}
