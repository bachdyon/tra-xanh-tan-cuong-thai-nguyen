import React from 'react';
import type { Product } from '../types';

function getEffectivePrice(p: Product): number {
  if (p.salePrice != null && p.saleEndDate) {
    try {
      if (new Date(p.saleEndDate).getTime() > Date.now()) return p.salePrice;
    } catch {}
  }
  return p.price;
}

interface HeroProps {
  featuredProduct: Product | null;
}

const HERO_BG_IMAGE = 'https://bqlkkt.laichau.gov.vn/upload/2000066/20211108/9_12f24.jpg';

export default function Hero({ featuredProduct }: HeroProps) {
  const img = featuredProduct?.thumbnail || 'https://haitratancuong.com/wp-content/uploads/2024/01/hop_tra_thai_nguyen_bieu_tang.png';
  const name = featuredProduct?.name || 'Trà Xanh Thượng Hạng';
  const price = featuredProduct ? getEffectivePrice(featuredProduct) : null;

  return (
    <section className="pt-16 relative">
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG_IMAGE}
          alt="Đồi chè Tân Cương"
          className="w-full h-full object-cover opacity-90 min-h-[400px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-tea-dark/90 to-tea-dark/40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-white">
          <div className="inline-block bg-red-accent text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 tracking-wider uppercase">
            Thái Nguyên Đệ Nhất Danh Trà
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-4 text-gold-light">
            {name.includes('Trà') ? name : `Trà Xanh ${name}`}
          </h1>
          <p className="text-xl md:text-2xl mb-6 font-serif italic text-tea-light">
            &quot;Chát dịu ngọt thanh - 100% từ thiên nhiên&quot;
          </p>
          <p className="mb-8 text-gray-200 max-w-md leading-relaxed">
            Tuyển chọn từ những búp chè non 1 tôm 2 lá tại vùng đất Tân Cương trứ danh. Mang đến hương vị cốm non đặc trưng, nước xanh trong, hậu ngọt sâu lắng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#pricing"
              className="bg-gold text-tea-dark px-8 py-4 rounded-full font-bold text-lg text-center hover:bg-gold-light transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Đặt Mua Ngay
            </a>
            <a
              href="tel:0987654321"
              className="bg-white/20 backdrop-blur-sm border border-white/50 text-white px-8 py-4 rounded-full font-bold text-lg text-center hover:bg-white/30 transition"
            >
              Tư Vấn Miễn Phí
            </a>
          </div>
        </div>

        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
          <div className="relative w-80 md:w-96 p-4 backdrop-blur-sm bg-white/10 rounded-3xl border-2 border-gold/30">
            <img
              src={img}
              alt={featuredProduct?.name || 'Hộp trà Thái Nguyên'}
              className="w-full h-48 md:h-56 object-cover rounded-2xl shadow-2xl"
            />
            {price != null && (
              <p className="text-center mt-3 text-gold-light font-bold text-xl">
                {price.toLocaleString('vi-VN')}đ
              </p>
            )}
            <div className="absolute -bottom-4 -right-4 bg-red-accent text-white p-4 rounded-full font-bold shadow-lg border-2 border-gold transform rotate-12 text-sm">
              100% Tự Nhiên
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
