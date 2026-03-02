# Hướng dẫn setup website bán hàng (lần đầu)

Hướng dẫn từng bước để cấu hình website bán trà Tân Cương với Google Sheet, PayOS và Vercel. Làm đúng thứ tự thì website sẽ chạy được.

---

## 1. Tạo trang tính Google (Spreadsheet)

1. Vào [Google Sheets](https://sheets.google.com) và tạo **trang tính mới**.
2. Đặt tên trang tính (ví dụ: **Cửa hàng Trà Tân Cương**).
3. **Lưu ý:** Bạn **không** cần tạo các sheet con (Products, Orders, …). Code sẽ tự tạo khi chạy.

**Bạn đã hoàn thành bước 1 khi có một trang tính trống với tên bạn chọn.**

---

## 2. Gắn code Google Apps Script (GAS)

1. Trong trang tính, bấm **Extensions** (Tiện ích).
2. Chọn **Apps Script**.
3. Xóa toàn bộ nội dung trong file `Code.gs`, sau đó mở file `gas/code.gs` trong dự án (repo) và **copy toàn bộ** nội dung vào.
4. Bấm **Lưu** (biểu tượng đĩa) hoặc Ctrl+S.

**Bạn sẽ thấy:** File có tên `Code.gs` và không còn báo lỗi đỏ.

---

## 3. Cấu hình Script Properties (bí mật)

1. Trong Apps Script, bấm **Project settings** (biểu tượng bánh răng bên trái).
2. Kéo xuống phần **Script properties**, bấm **Add script property**.
3. Thêm lần lượt từng cặp **Property** và **Value** (sau khi có đủ thông tin từ bước PayOS và Vercel):

| Property | Value (ví dụ / ghi chú) |
|----------|-------------------------|
| `PAYOS_CLIENT_ID` | Lấy từ Bước 4 |
| `PAYOS_API_KEY` | Lấy từ Bước 4 |
| `PAYOS_CHECKSUM_KEY` | Lấy từ Bước 4 |
| `FRONTEND_URL` | URL Vercel, ví dụ: `https://ten-website.vercel.app` (Bước 6) |
| `HOOKDECK_SOURCE_URL` | URL nguồn Hookdeck (Bước 7) |

4. Mỗi lần thêm xong một cặp, bấm **Add script property** để thêm cặp tiếp theo.
5. **Lưu ý:** Không commit các giá trị này lên Git; chỉ điền trong Script Properties.

**Bạn đã hoàn thành bước 3 khi đã thêm đủ 5 property (có thể thêm sau khi có PayOS và Vercel URL).**

---

## 4. Lấy key PayOS

**PayOS không có Sandbox.** Bạn cần dùng kênh thanh toán thật.

1. Đăng nhập [Dashboard PayOS](https://my.payos.vn/).
2. Vào **Kênh thanh toán** (hoặc mục tương đương để quản lý kênh).
3. Tạo hoặc chọn một **kênh thanh toán**.
4. Trong cài đặt kênh, sao chép:
   - **Client ID** → dán vào Script Property `PAYOS_CLIENT_ID`.
   - **API Key** → dán vào `PAYOS_API_KEY`.
   - **Checksum Key** → dán vào `PAYOS_CHECKSUM_KEY`.
5. Sao chép **đủ và không thừa ký tự**.

**Bạn đã hoàn thành bước 4 khi đã điền đủ 3 key PayOS vào Script Properties.**

---

## 5. Deploy GAS dạng Web App

1. Trong Apps Script, bấm **Deploy** (Triển khai) → **New deployment**.
2. Bấm biểu tượng bút cạnh **Select type**, chọn **Web app**.
3. **Description:** ghi ngắn (ví dụ: "API landing trà").
4. **Execute as:** chọn **Me** (tài khoản của bạn).
5. **Who has access:** chọn **Anyone** (Bất kỳ ai).  
   **Quan trọng:** Nếu chọn "Only myself", website bên ngoài không gọi được API.
6. Bấm **Deploy**.
7. Ở màn hình sau khi deploy, **sao chép URL Web App** (dạng `https://script.google.com/macros/s/.../exec`). Lưu lại để dùng cho frontend.

**Bạn đã hoàn thành bước 5 khi có URL Web App.**

---

## 6. Deploy frontend lên Vercel (bắt buộc)

1. Đăng nhập [Vercel](https://vercel.com).
2. Import dự án (GitHub/GitLab hoặc upload thư mục dự án).
3. Trong **Environment Variables**, thêm:
   - **Name:** `VITE_APP_GAS_URL`  
   - **Value:** URL Web App đã copy ở Bước 5 (không thêm dấu `/` ở cuối).
4. Bấm **Deploy**.
5. Sau khi deploy xong, sao chép **URL trang web** (ví dụ: `https://ten-website.vercel.app`). Dán URL này vào Script Property `FRONTEND_URL` (Bước 3).

**Bạn đã hoàn thành bước 6 khi website mở được và có URL production.**

---

## 7. Cấu hình Hookdeck (Webhook PayOS)

1. Đăng nhập [Hookdeck](https://hookdeck.com) và tạo **Source** mới.
2. **Destination:** nhập URL Web App GAS (Bước 5). Hookdeck sẽ chuyển request từ PayOS tới GAS.
3. Sau khi tạo, sao chép **Source URL** (URL nguồn). Dán vào Script Property `HOOKDECK_SOURCE_URL`.
4. Vào [Dashboard PayOS](https://my.payos.vn/) → Cài đặt kênh → **Webhook URL**. Dán **Source URL** của Hookdeck vào đây.
5. Trong Google Sheet, mở **Extensions** → **Apps Script** → chạy lại menu **⚡ Quản lý Shop** → **Xác thực Webhook PayOS** để xem lại URL cần đăng ký (nếu cần).

**Bạn đã hoàn thành bước 7 khi PayOS gửi webhook qua Hookdeck tới GAS.**

---

## 8. Khởi tạo dữ liệu mẫu (lần đầu)

1. Mở lại **Google Sheet** (trang tính đã gắn GAS).
2. Trong menu, chọn **⚡ Quản lý Shop** → **Khởi tạo dữ liệu mẫu**.
3. Nếu hỏi ghi đè, chọn **Có** để tạo sản phẩm mẫu.
4. Mở website (Vercel) và kiểm tra: trang chủ hiển thị bảng giá / sản phẩm.

**Bạn đã hoàn thành bước 8 khi trang chủ có sản phẩm và có thể chọn mua, đặt hàng.**

---

## Tóm tắt checklist

- [ ] Tạo 1 trang tính Google, gắn code GAS.
- [ ] Thêm Script Properties: PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY, FRONTEND_URL, HOOKDECK_SOURCE_URL.
- [ ] Lấy key PayOS từ Dashboard (không dùng Sandbox).
- [ ] Deploy GAS dạng Web app, chọn **Anyone**, copy URL.
- [ ] Deploy frontend lên Vercel, cấu hình `VITE_APP_GAS_URL`.
- [ ] Tạo Hookdeck Source → Destination = URL GAS; đăng ký Source URL làm Webhook URL trong PayOS.
- [ ] Chạy menu **Khởi tạo dữ liệu mẫu** trong Sheet.
