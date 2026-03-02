import React from 'react';
import { Phone, MessageCircle, Leaf } from 'lucide-react';

const PHONE = '0987654321';
const ZALO_URL = 'https://zalo.me/0987654321';

export default function Footer() {
  return (
    <footer className="bg-surface-bg border-t-4 border-gold border-surface-border text-text-muted py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="font-serif text-2xl font-bold text-gold flex items-center gap-2 mb-6">
            <Leaf />
            Tân Cương Trà
          </div>
          <p className="mb-6 max-w-md text-text-primary">
            Chuyên cung cấp các sản phẩm chè xanh Tân Cương Thái Nguyên chính gốc, chất lượng thượng hạng, làm quà biếu tặng cao cấp.
          </p>
          <div className="space-y-3 text-text-muted text-sm">
            <p><strong className="text-text-primary">Địa chỉ vườn trà:</strong> Xã Tân Cương, TP. Thái Nguyên, Tỉnh Thái Nguyên</p>
            <p><strong className="text-text-primary">Cửa hàng:</strong> 123 Đường Trà Xanh, Quận Cầu Giấy, Hà Nội</p>
          </div>
        </div>

        <div className="md:text-right flex flex-col md:items-end justify-center">
          <h3 className="text-xl font-bold text-text-primary mb-6">Liên Hệ Đặt Hàng Ngay</h3>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center justify-center md:justify-end gap-3 bg-gold text-tea-dark px-6 py-4 rounded-xl font-bold text-xl hover:bg-gold-light transition"
            >
              <Phone size={24} />
              {PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3')}
            </a>
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center md:justify-end gap-3 bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-xl hover:bg-blue-500 transition"
            >
              <MessageCircle size={24} />
              Chat Zalo Ngay
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-surface-border text-center text-sm text-text-muted">
        &copy; {new Date().getFullYear()} Tân Cương Trà. All rights reserved.
      </div>
    </footer>
  );
}
