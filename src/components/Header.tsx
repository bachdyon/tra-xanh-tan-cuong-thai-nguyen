import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Leaf, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';

const PHONE = '0987654321';
const ZALO_URL = 'https://zalo.me/0987654321';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { items } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-page-bg/95 backdrop-blur border-b border-surface-border z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold text-gold flex items-center gap-2">
          <Leaf className="text-tea-light" />
          Tân Cương Trà
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-surface-border bg-surface-bg text-text-primary hover:bg-surface-muted transition"
            aria-label={theme === 'dark' ? 'Bật sáng' : 'Bật tối'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a
            href={`tel:${PHONE}`}
            className="hidden md:flex items-center gap-2 bg-gold text-tea-dark px-4 py-2 rounded-full font-semibold hover:bg-gold-light transition"
          >
            <Phone size={18} />
            {PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3')}
          </a>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
          >
            <MessageCircle size={18} />
            Zalo
          </a>
          <button
            type="button"
            className="md:hidden p-2 rounded-lg border border-surface-border bg-surface-bg text-text-primary"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-page-bg px-4 py-3 flex flex-col gap-2">
          <a
            href={`tel:${PHONE}`}
            className="flex items-center gap-2 text-text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            <Phone size={18} />
            {PHONE.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3')}
          </a>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-text-primary py-2"
            onClick={() => setMobileOpen(false)}
          >
            <MessageCircle size={18} />
            Zalo
          </a>
          {items.length > 0 && (
            <p className="text-text-muted text-sm pt-2">
              Giỏ hàng: {items.length} mục · {items.reduce((s, i) => s + i.total, 0).toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      )}
    </header>
  );
}
