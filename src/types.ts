export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  tags: string[];
  price: number;
  salePrice: number | null;
  saleEndDate: string | null;
  images: string[];
  thumbnail: string | null;
  description: string | null;
  specs: unknown[];
  features: unknown[];
  stock: number;
  sku: string | null;
  isFeatured: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderStatusData {
  orderCode: number;
  status: string;
  totalAmount: number;
}

export interface CreateOrderPayload {
  action: 'createOrder';
  customerName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  expectedTotal: number;
  items: { id: string; quantity: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PriceChangedData {
  updatedItems: CartItem[];
  actualTotal: number;
}
