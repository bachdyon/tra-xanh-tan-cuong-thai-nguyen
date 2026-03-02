import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { getOrderStatus } from '../services/api';
import { useCart } from '../contexts/CartContext';

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_MS = 2 * 60 * 1000;

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode') || '';
  const [status, setStatus] = useState<'PAID' | 'PENDING' | 'not_found' | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { clear } = useCart();

  useEffect(() => {
    if (!orderCode) {
      setStatus('not_found');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const start = Date.now();

    const check = async () => {
      const res = await getOrderStatus(orderCode);
      if (cancelled) return;
      if (!res.success) {
        setStatus('not_found');
        setLoading(false);
        return;
      }
      const data = res.data!;
      setTotalAmount(data.totalAmount);
      if (data.status === 'PAID') {
        clear();
        setStatus('PAID');
        setLoading(false);
        return;
      }
      setStatus(data.status === 'PENDING' ? 'PENDING' : 'not_found');
      setLoading(false);
    };

    const poll = async () => {
      await check();
      if (cancelled) return;
      const interval = setInterval(async () => {
        if (Date.now() - start > POLL_MAX_MS) {
          clearInterval(interval);
          return;
        }
        const res = await getOrderStatus(orderCode);
        if (cancelled) return;
        if (res.success && res.data?.status === 'PAID') {
          clear();
          setStatus('PAID');
          setTotalAmount(res.data.totalAmount);
          clearInterval(interval);
        }
      }, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderCode, clear]);

  if (loading && status === null && orderCode) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-gold mb-4" />
          <p className="text-text-primary font-medium">Đang xác nhận đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (status === 'PAID') {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-bg border border-surface-border rounded-2xl p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-tea-green mb-6" />
          <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">Thanh toán thành công!</h1>
          <p className="text-text-muted mb-4">
            Mã đơn: <strong className="text-text-primary">{orderCode}</strong>
          </p>
          {totalAmount != null && (
            <p className="text-text-muted mb-8">
              Tổng tiền: <strong className="text-text-primary">{totalAmount.toLocaleString('vi-VN')}đ</strong>
            </p>
          )}
          <Link
            to="/"
            className="inline-block bg-gold text-tea-dark px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'PENDING') {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-bg border border-surface-border rounded-2xl p-8 text-center">
          <Loader2 size={48} className="mx-auto text-gold mb-4 animate-spin" />
          <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">Đang xác nhận...</h1>
          <p className="text-text-muted mb-6">
            Chúng tôi đang xác nhận thanh toán. Trang sẽ tự cập nhật khi hoàn tất.
          </p>
          <p className="text-text-muted text-sm">Mã đơn: {orderCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-bg border border-surface-border rounded-2xl p-8 text-center">
        <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">Không tìm thấy đơn hàng</h1>
        <p className="text-text-muted mb-6">
          Mã đơn không tồn tại hoặc chưa được ghi nhận. Vui lòng liên hệ shop để được hỗ trợ.
        </p>
        <Link
          to="/"
          className="inline-block bg-gold text-tea-dark px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
