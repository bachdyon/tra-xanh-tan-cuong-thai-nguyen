import React from 'react';
import { Leaf, ShieldCheck, ThumbsUp } from 'lucide-react';

export default function TrustBlock() {
  return (
    <section className="py-16 bg-surface-muted">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">Tinh Hoa Trà Việt</h2>
          <div className="w-24 h-1 bg-gold mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-bg p-8 rounded-2xl shadow-sm border border-surface-border text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-tea-light rounded-full flex items-center justify-center mx-auto mb-6 text-tea-dark">
              <Leaf size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-3">Hương Vị Đặc Trưng</h3>
            <p className="text-text-muted">Nước trà xanh trong, sánh vàng. Hương cốm non thoang thoảng, vị chát dịu ban đầu và hậu ngọt sâu lắng khó quên.</p>
          </div>

          <div className="bg-surface-bg p-8 rounded-2xl shadow-sm border border-surface-border text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-tea-light rounded-full flex items-center justify-center mx-auto mb-6 text-tea-dark">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-3">Sạch & An Toàn</h3>
            <p className="text-text-muted">Trồng và chăm sóc theo tiêu chuẩn VietGAP. 100% không hóa chất, không chất bảo quản, an toàn tuyệt đối cho sức khỏe.</p>
          </div>

          <div className="bg-surface-bg p-8 rounded-2xl shadow-sm border border-surface-border text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-tea-light rounded-full flex items-center justify-center mx-auto mb-6 text-tea-dark">
              <ThumbsUp size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-3">Chất Lượng Thượng Hạng</h3>
            <p className="text-text-muted">Thu hái thủ công vào sáng sớm, sao chè bằng phương pháp truyền thống kết hợp công nghệ hiện đại giữ trọn tinh hoa.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
