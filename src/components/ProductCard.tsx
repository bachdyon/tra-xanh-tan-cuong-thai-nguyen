import React from 'react';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';

function getEffectivePrice(p: Product): number {
  if (p.salePrice != null && p.saleEndDate) {
    try {
      if (new Date(p.saleEndDate).getTime() > Date.now()) return p.salePrice;
    } catch {}
  }
  return p.price;
}

interface ProductCardProps {
  product: Product;
  onCheckout?: () => void;
  key?: string;
}

export default function ProductCard({ product, onCheckout }: ProductCardProps) {
  const { addItem } = useCart();
  const price = getEffectivePrice(product);
  const hasSale = product.salePrice != null && product.saleEndDate && new Date(product.saleEndDate).getTime() > Date.now();
  const isBestseller = product.tags?.includes('Bán chạy');

  const handleChonMua = () => {
    addItem({
      id: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: price,
      total: price,
    });
    onCheckout?.();
  };

  return (
    <div className="border border-surface-border rounded-3xl p-8 flex flex-col relative bg-surface-bg hover:shadow-xl transition duration-300">
      {isBestseller && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gold text-tea-dark px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-md">
          Bán Chạy Nhất
        </div>
      )}
      <div className="text-center mb-6 mt-2">
        <h3 className="font-serif text-2xl font-bold text-text-primary mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-text-muted text-sm line-clamp-2">{product.description}</p>
        )}
      </div>
      {product.thumbnail && (
        <div className="mb-4 rounded-xl overflow-hidden aspect-[4/3] bg-surface-muted">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-surface-muted text-text-muted text-xs px-2 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="text-center mb-6">
        {hasSale && product.price != null && (
          <div className="text-text-muted line-through text-lg mb-1">
            {product.price.toLocaleString('vi-VN')}đ
          </div>
        )}
        <span className="text-4xl font-bold text-red-accent">
          {price.toLocaleString('vi-VN')}đ
        </span>
      </div>
      <button
        type="button"
        onClick={handleChonMua}
        disabled={product.stock < 1}
        className="w-full py-3 rounded-xl font-semibold bg-tea-dark text-white hover:bg-tea-green transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {product.stock < 1 ? 'Hết hàng' : 'Chọn mua'}
      </button>
    </div>
  );
}
