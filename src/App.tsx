import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailedPage from './pages/OrderFailedPage';

export default function App() {
  return (
    <ThemeProvider>
      <ProductProvider>
        <CartProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />
              <Route path="/payment-failed" element={<OrderFailedPage />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </CartProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}
