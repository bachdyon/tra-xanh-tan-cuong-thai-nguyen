import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';

const PHONE = '0987654321';
const ZALO_URL = 'https://zalo.me/0987654321';

export default function OrderFailedPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode') || '';

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-bg border border-surface-border rounded-2xl p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">
          Thanh toán không thành công
        </h1>
        <p className="text-text-muted mb-4">
          Giao dịch chưa hoàn tất. Bạn có thể thử thanh toán lại hoặc liên hệ shop.
        </p>
        {orderCode && (
          <p className="text-text-muted mb-6">
            Mã đơn: <strong className="text-text-primary">{orderCode}</strong>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-block bg-gold text-tea-dark px-6 py-3 rounded-xl font-bold hover:bg-gold-light transition"
          >
            Về trang chủ để thử lại
          </Link>
          <a
            href={`tel:${PHONE}`}
            className="inline-flex items-center justify-center gap-2 bg-tea-dark text-white px-6 py-3 rounded-xl font-semibold hover:bg-tea-green transition"
          >
            <Phone size={20} />
            Gọi shop
          </a>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-500 transition"
          >
            <MessageCircle size={20} />
            Zalo
          </a>
        </div>
      </div>
    </div>
  );
}
