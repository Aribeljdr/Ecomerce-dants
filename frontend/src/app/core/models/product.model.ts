export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  parent?: string;
  order?: number;
  children?: Category[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category;
  brand: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  products: Product[];
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}
