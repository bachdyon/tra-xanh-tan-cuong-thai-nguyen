import React, { useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import Hero from '../components/Hero';
import TrustBlock from '../components/TrustBlock';
import ProductCard from '../components/ProductCard';
import CamKetBlock from '../components/CamKetBlock';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { useProducts } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';

const PHONE = '0987654321';
const ZALO_URL = 'https://zalo.me/0987654321';

export default function LandingPage() {
  const { products, loading, error } = useProducts();
  const { items } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const featured = products.find((p) => p.isFeatured) || products[0] || null;

  return (
    <div className="min-h-screen bg-page-bg text-text-primary">
      <Hero featuredProduct={featured} />
      <TrustBlock />

      <section id="pricing" className="py-20 bg-page-bg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Bảng Giá Ưu Đãi
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Chọn gói sản phẩm phù hợp với nhu cầu của bạn. Mua càng nhiều, ưu đãi càng lớn!
            </p>
            <div className="w-24 h-1 bg-gold mx-auto mt-6" />
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-surface-border rounded-3xl p-8 h-80 bg-surface-muted animate-pulse"
                />
              ))}
            </div>
          )}
          {error && (
            <p className="text-center text-red-accent py-8">{error}</p>
          )}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onCheckout={() => setCheckoutOpen(true)}
                />
              ))}
            </div>
          )}
          {!loading && !error && products.length === 0 && (
            <p className="text-center text-text-muted py-12">
              Chưa có sản phẩm. Quản trị viên hãy dùng menu &quot;⚡ Quản lý Shop&quot; → Khởi tạo dữ liệu mẫu.
            </p>
          )}

          {items.length > 0 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setCheckoutOpen(true)}
                className="bg-gold text-tea-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-gold-light transition shadow-lg"
              >
                Thanh toán ({items.length} mục · {items.reduce((s, i) => s + i.total, 0).toLocaleString('vi-VN')}đ)
              </button>
            </div>
          )}
        </div>
      </section>

      <CamKetBlock />
      <Footer />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      <div className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 md:hidden">
        <a
          href={`tel:${PHONE}`}
          className="w-14 h-14 bg-gold text-tea-dark rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          aria-label="Gọi điện"
        >
          <Phone size={24} />
        </a>
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noreferrer"
          className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
          aria-label="Zalo"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
}
