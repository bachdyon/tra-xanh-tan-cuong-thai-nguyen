# Landing page bán hàng – Tính năng (Features)

Áp dụng cho **bất kỳ** landing page bán hàng cùng stack (React + GAS + Sheets + PayOS). Tính năng cho khách hàng và quản trị; không đề cập kỹ thuật. **Tham chiếu:** 02-CONSTRAINTS, 03-PLAN.

---

QUAN TRỌNG: 
- "Hỏi người dùng nếu bạn chưa rõ họ muốn tạo landing page để làm gì?"
- "Hỏi người dùng nếu bạn chưa biết họ sẽ có những gói sản phẩm / dịch vụ nào, giá từng gói là bao nhiêu?"
- "Hỏi người dùng đã có thiết kế chưa? Nếu có tuyệt đối tuân thủ thiết kế."

## Khách hàng (Frontend)

### Landing (trang chính)
- **Giao diện** landing page bán hàng.
- **Form đặt hàng:** Mở bằng modal/section. Khách chọn gói từ card → nhập Tên, SĐT, Email, Địa chỉ → "Thanh toán". Không hiển thị chữ PayOS. Spinner + disable nút khi đang tạo đơn. Honeypot chống bot. PRICE_CHANGED: toast "Giá đã thay đổi...", cập nhật items/tổng, user bấm Thanh toán lại.
- **Thông tin liên hệ:** Gọi điện, Email ở cuối trang, Zalo (header + có thể nút float mobile).
- Không bắt buộc trang chi tiết sản phẩm riêng; thông tin gói/SP có thể đủ trên landing. Không filter/sort/tìm kiếm toàn trang.

### Sau thanh toán
- **Success (`/order-success`):** Xác thực trạng thái qua server (không tin URL). PAID: "Thanh toán thành công!", xóa giỏ/state đơn. PENDING: "Đang xác nhận...", poll tối đa 2 phút. Không tìm thấy: liên hệ shop.
- **Failed (`/payment-failed`):** "Thanh toán không thành công", mã đơn, nút thử lại hoặc liên hệ shop.

### UX chung
- **Theme:** Light/Dark (hệ thống hoặc lựa chọn). Form/input màu theo design system (tokens input-bg, input-border, input-text). Nền trang đồng bộ — body, Layout, Header dùng một token page-bg; kiểm tra cả Light và Dark.
- **Responsive:** Header: logo, CTA (điện thoại, Zalo), theme toggle; mobile có thể hamburger. Grid 1/2/4 cột cho block nội dung. Form đặt hàng: section hoặc modal, không bắt buộc cart sidebar/bottom sheet.
- **Toast** khi lỗi (chọn mua, tạo đơn, fetch).
- Thiết kế minh bạch, dễ dùng.

---

## Quản trị (Google Sheet + Menu)

### Menu "⚡ Quản lý Shop"
- **Khởi tạo dữ liệu mẫu:** Ghi Products (nội dung theo ngành dự án). Có data → hỏi ghi đè. Chỉ cần bấm nút, không copy/paste.
- **Xác thực Webhook PayOS:** Đăng ký URL qua Hookdeck. Thông báo thành công/lỗi.
- **Update lại cache:** Xóa cache server; lần xem tiếp lấy data mới từ Sheet.

### Sheets (tự tạo)
- **Products, Orders, WebhookLogs, Config:** Code tự tạo. User chỉ tạo 1 spreadsheet.
- **Products:** Giá, tồn kho, giảm giá, nổi bật, specs, ảnh. Danh mục + nhãn (Hàng mới, Bán chạy, Giảm giá) theo dự án.
- **Orders:** Mã đơn, khách, sản phẩm, tổng, PENDING/PAID. PENDING quá 1 ngày → theo dõi/hủy.
- **WebhookLogs:** Log lỗi webhook. **Config:** Bộ đếm mã đơn.