import type { Product, OrderStatusData, CreateOrderPayload, ApiResponse, PriceChangedData } from '../types';

const GAS_URL = import.meta.env.VITE_APP_GAS_URL || '';

function getBaseUrl(): string {
  if (GAS_URL) return GAS_URL.replace(/\/$/, '');
  return '';
}

export async function getProducts(): Promise<Product[]> {
  const base = getBaseUrl();
  if (!base) return [];
  const url = `${base}?action=getProducts`;
  const res = await fetch(url);
  const json: ApiResponse<Product[]> = await res.json();
  if (!json.success || !json.data) return [];
  return json.data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const base = getBaseUrl();
  if (!base) return null;
  const url = `${base}?action=getProductBySlug&slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  const json: ApiResponse<Product> = await res.json();
  if (!json.success || !json.data) return null;
  return json.data;
}

export async function getOrderStatus(orderCode: string | number): Promise<ApiResponse<OrderStatusData>> {
  const base = getBaseUrl();
  if (!base) return { success: false, error: 'No API URL' };
  const url = `${base}?action=getOrderStatus&orderCode=${encodeURIComponent(String(orderCode))}`;
  const res = await fetch(url);
  return res.json();
}

export async function createOrder(
  payload: Omit<CreateOrderPayload, 'action'>
): Promise<
  | { success: true; data: { orderCode: number; checkoutUrl: string } }
  | { success: false; error: string; data?: PriceChangedData }
> {
  const base = getBaseUrl();
  if (!base) return { success: false, error: 'Chưa cấu hình API.' };
  const body: CreateOrderPayload = { ...payload, action: 'createOrder' };
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.success && json.data?.checkoutUrl) {
    return { success: true, data: { orderCode: json.data.orderCode, checkoutUrl: json.data.checkoutUrl } };
  }
  if (json.error === 'PRICE_CHANGED' && json.data) {
    return { success: false, error: 'PRICE_CHANGED', data: json.data as PriceChangedData };
  }
  return { success: false, error: json.error || 'Tạo đơn thất bại', data: json.data };
}
