import { Injectable, inject } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Product, ProductFilters, ProductsResponse, Category } from '../models/product.model';
import { IdbService } from './idb.service';
import { SeedProduct, SeedCategory } from '../data/seed-data';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private idb = inject(IdbService);

  getProducts(filters: ProductFilters = {}): Observable<ProductsResponse> {
    return from(this.queryProducts(filters, false));
  }

  getProductsRaw(queryParams: Record<string, string>): Observable<ProductsResponse> {
    const filters: ProductFilters = {
      category:  queryParams['category']  || undefined,
      brand:     queryParams['brand']     || undefined,
      search:    queryParams['search']    || undefined,
      sort:      queryParams['sort']      || undefined,
      minPrice:  queryParams['minPrice']  ? +queryParams['minPrice']  : undefined,
      maxPrice:  queryParams['maxPrice']  ? +queryParams['maxPrice']  : undefined,
      page:      queryParams['page']      ? +queryParams['page']      : undefined,
      limit:     queryParams['limit']     ? +queryParams['limit']     : undefined,
      featured:  queryParams['featured']  ? queryParams['featured'] === 'true' : undefined,
    };
    return this.getProducts(filters);
  }

  getProductBySlug(slug: string): Observable<{ success: boolean; product: Product }> {
    return from((async () => {
      const p = await this.idb.getByIndex<SeedProduct>('products', 'slug', slug);
      if (!p) throw new Error('Producto no encontrado');
      const product = await this.attachCategory(p);
      return { success: true, product };
    })());
  }

  getFeatured(): Observable<ProductsResponse> {
    return this.getProducts({ featured: true, limit: 8 });
  }

  getCategories(): Observable<{ success: boolean; categories: Category[] }> {
    return from(
      this.idb.getAll<SeedCategory>('categories').then(cats => ({
        success: true,
        categories: (cats as Category[]).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
      }))
    );
  }

  getBrands(categorySlug?: string): Observable<{ success: boolean; brands: string[] }> {
    return from((async () => {
      const products = categorySlug
        ? await this.idb.getAllByIndex<SeedProduct>('products', 'categorySlug', categorySlug)
        : await this.idb.getAll<SeedProduct>('products');
      const brands = [...new Set(products.map(p => p.brand))].sort();
      return { success: true, brands };
    })());
  }

  createProduct(data: Partial<Product>): Observable<{ success: boolean; product: Product }> {
    return from((async () => {
      const categoryId = (data.category as any)?._id ?? data.category ?? '';
      const cat = await this.idb.getById<SeedCategory>('categories', categoryId);

      const newProduct: SeedProduct = {
        _id:           crypto.randomUUID(),
        name:          data.name         ?? '',
        slug:          this.slugify(data.name ?? ''),
        category:      categoryId,
        categorySlug:  cat?.slug         ?? '',
        brand:         data.brand        ?? '',
        price:         data.price        ?? 0,
        compareAtPrice: data.compareAtPrice,
        stock:         data.stock        ?? 0,
        images:        data.images       ?? [],
        description:   data.description  ?? '',
        specs:         data.specs        ?? {},
        tags:          data.tags         ?? [],
        featured:      data.featured     ?? false,
        rating:        0,
        reviewCount:   0,
        isActive:      data.isActive     ?? true,
        createdAt:     new Date().toISOString(),
      };
      await this.idb.put('products', newProduct);
      const product = await this.attachCategory(newProduct);
      return { success: true, product };
    })());
  }

  updateProduct(id: string, data: Partial<Product>): Observable<{ success: boolean; product: Product }> {
    return from((async () => {
      const existing = await this.idb.getById<SeedProduct>('products', id);
      if (!existing) throw new Error('Producto no encontrado');

      let categoryId   = existing.category;
      let categorySlug = existing.categorySlug;
      if (data.category !== undefined) {
        categoryId = (data.category as any)?._id ?? (data.category as any) ?? existing.category;
        const cat  = await this.idb.getById<SeedCategory>('categories', categoryId);
        categorySlug = cat?.slug ?? existing.categorySlug;
      }

      const updated: SeedProduct = {
        ...existing,
        name:          data.name          ?? existing.name,
        slug:          data.name          ? this.slugify(data.name) : existing.slug,
        category:      categoryId,
        categorySlug,
        brand:         data.brand         ?? existing.brand,
        price:         data.price         ?? existing.price,
        compareAtPrice: data.compareAtPrice !== undefined ? data.compareAtPrice : existing.compareAtPrice,
        stock:         data.stock         ?? existing.stock,
        images:        data.images        ?? existing.images,
        description:   data.description   ?? existing.description,
        specs:         data.specs         ?? existing.specs,
        tags:          data.tags          ?? existing.tags,
        featured:      data.featured      ?? existing.featured,
        isActive:      data.isActive      ?? existing.isActive,
      };
      await this.idb.put('products', updated);
      const product = await this.attachCategory(updated);
      return { success: true, product };
    })());
  }

  deleteProduct(id: string): Observable<{ success: boolean }> {
    return from(
      this.idb.delete('products', id).then(() => ({ success: true }))
    );
  }

  getAllProductsAdmin(filters: ProductFilters = {}): Observable<ProductsResponse> {
    return from(this.queryProducts(filters, true));
  }

  createCategory(data: { name: string; parent?: string; icon?: string; order?: number }): Observable<{ success: boolean; category: Category }> {
    return from((async () => {
      const newCat: SeedCategory = {
        _id:   crypto.randomUUID(),
        name:  data.name,
        slug:  this.slugify(data.name),
        icon:  data.icon,
        order: data.order ?? 99,
      };
      await this.idb.put('categories', newCat);
      return { success: true, category: newCat as Category };
    })());
  }

  deleteCategory(id: string): Observable<{ success: boolean }> {
    return from(
      this.idb.delete('categories', id).then(() => ({ success: true }))
    );
  }

  private async queryProducts(filters: ProductFilters, showAll: boolean): Promise<ProductsResponse> {
    const idbFilters = showAll ? { ...filters, showAll: true } as any : filters;
    const products = await this.idb.getProductsFiltered(idbFilters);

    if (filters.sort === 'price_asc')       products.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'rating')     products.sort((a, b) => b.rating - a.rating);
    else if (filters.sort === 'newest')     products.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = products.length;
    const limit = filters.limit ?? 12;
    const page  = filters.page  ?? 1;
    const pages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const sliced = products.slice(start, start + limit);

    const categories = await this.idb.getAll<SeedCategory>('categories');
    const catMap = new Map(categories.map(c => [c._id, c]));

    const mapped: Product[] = sliced.map(p => ({
      ...p,
      category: (catMap.get(p.category) ?? { _id: p.category, name: '', slug: '' }) as Category,
    }));

    return { success: true, total, page, pages, products: mapped };
  }

  private async attachCategory(p: SeedProduct): Promise<Product> {
    const cat = await this.idb.getById<SeedCategory>('categories', p.category);
    return {
      ...p,
      category: (cat ?? { _id: p.category, name: '', slug: '' }) as Category,
    };
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
