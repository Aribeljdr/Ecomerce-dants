export interface AdminStats {
  products: { total: number; active: number; lowStock: number };
  orders: { total: number; pending: number; revenue: number; byStatus: Record<string, number> };
  users: { total: number };
}
