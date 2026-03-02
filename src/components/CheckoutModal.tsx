import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { createOrder } from '../services/api';
import type { CartItem } from '../types';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (checkoutUrl: string) => void;
}

export default function CheckoutModal({ open, onClose, onSuccess }: CheckoutModalProps) {
  const { items, setItems, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    website: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Giỏ hàng trống.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        website: form.website,
        expectedTotal: total,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      };
      const res = await createOrder(payload);
      if (res.success && res.data?.checkoutUrl) {
        clear();
        onClose();
        onSuccess?.(res.data.checkoutUrl);
        window.location.href = res.data.checkoutUrl;
        return;
      }
      if (!res.success) {
        const err = res as { error: string; data?: { updatedItems: CartItem[] } };
        if (err.error === 'PRICE_CHANGED' && err.data?.updatedItems) {
          setItems(err.data.updatedItems);
          toast('Giá một số sản phẩm đã thay đổi. Vui lòng kiểm tra và Thanh toán lại.', {
            icon: '🔄',
            duration: 5000,
          });
          return;
        }
        toast.error(err.error || 'Tạo đơn thất bại.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-surface-bg border border-surface-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 className="font-serif text-2xl font-bold text-text-primary">Đặt hàng & Thanh toán</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-muted text-text-primary"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-text-muted">Chưa có sản phẩm nào. Hãy chọn gói ở bên dưới.</p>
          ) : (
            <>
              <div className="bg-surface-muted rounded-xl p-4 space-y-2">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-text-primary">
                    <span>{i.name} × {i.quantity}</span>
                    <span>{(i.total).toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-text-primary pt-2 border-t border-surface-border">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <input
                type="text"
                name="website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                className="absolute -left-[9999px]"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />

              <div>
                <label className="block text-text-primary font-medium mb-1">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-input-bg border border-input-border text-input-text"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-text-primary font-medium mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-input-bg border border-input-border text-input-text"
                  placeholder="0987654321"
                />
              </div>
              <div>
                <label className="block text-text-primary font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-input-bg border border-input-border text-input-text"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-text-primary font-medium mb-1">Địa chỉ giao hàng *</label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-input-bg border border-input-border text-input-text resize-none"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gold text-tea-dark hover:bg-gold-light transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Đang tạo đơn...
                  </>
                ) : (
                  'Thanh toán'
                )}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
