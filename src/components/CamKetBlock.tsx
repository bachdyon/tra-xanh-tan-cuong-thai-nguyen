import React from 'react';

export default function CamKetBlock() {
  return (
    <section className="py-16 bg-tea-dark text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gold mb-6">Cam Kết Từ Tâm</h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8 font-serif italic">
          &quot;Chúng tôi mang đến không chỉ là một thức uống, mà là cả một nghệ thuật thưởng trà và niềm tự hào của quê hương Thái Nguyên.&quot;
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-gold mb-2">100%</div>
            <div className="text-sm text-gray-300">Trà sạch tự nhiên</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-gold mb-2">0%</div>
            <div className="text-sm text-gray-300">Hóa chất bảo quản</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-gold mb-2">7</div>
            <div className="text-sm text-gray-300">Ngày đổi trả miễn phí</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-gold mb-2">24/7</div>
            <div className="text-sm text-gray-300">Hỗ trợ tư vấn</div>
          </div>
        </div>
      </div>
    </section>
  );
}
