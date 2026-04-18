export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  _id: string;
  user?: string;
  guestEmail?: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment: { method: string; status: string; transactionId?: string };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
}

export interface CreateOrderPayload {
  items: { product: string; quantity: number }[];
  shipping: ShippingInfo;
  guestEmail?: string;
  payment?: { method: string };
}
