import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import type { Product } from '../types';

const CACHE_KEY = 'tra-tan-cuong-products';
const CACHE_TTL_MS = 3 * 60 * 1000;

interface ProductContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return [];
      const { data, at } = JSON.parse(raw);
      if (Date.now() - at < CACHE_TTL_MS && Array.isArray(data)) return data;
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(!products.length);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được sản phẩm');
      setProducts((prev) => prev);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const onFocus = () => fetchProducts();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchProducts]);

  return (
    <ProductContext.Provider value={{ products, loading, error, refetch: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
