# TestOpenCVjs - Pipeline Xử Lý Ảnh với OpenCV.js

Ứng dụng web đơn giản để thực nghiệm và xử lý ảnh hàng loạt ngay trên trình duyệt sử dụng thư viện **OpenCV.js**. Ứng dụng hiển thị trực quan các bước biến đổi của ảnh qua từng giai đoạn trong pipeline.

**🌐 Live Demo:** [https://vuquan2005.github.io/TestOpenCVjs/](https://vuquan2005.github.io/TestOpenCVjs/)

## 🚀 Tính Năng

- **Xử lý hàng loạt (Batch Processing)**: Áp dụng cùng một chuỗi xử lý cho nhiều ảnh cùng lúc.
- **Pipeline Trực Quan**: Hiển thị kết quả của từng bước xử lý theo từng hàng (Row), giúp dễ dàng so sánh và debug.
- **Đầu vào linh hoạt**:
    - Tự động tải danh sách ảnh mẫu mặc định (`img/`).
    - Cho phép tải lên ảnh từ máy tính (nút "Choose Files").
- **Quản lý bộ nhớ**: Tự động giải phóng bộ nhớ (Mat cleanup) sau mỗi bước để tối ưu hiệu năng.

## 📦 Cài Đặt và Chạy

Dự án không yêu cầu cài đặt backend phức tạp, chỉ cần một static server.

### Cách 1: Sử dụng `npx` (Khuyên dùng)

Nếu bạn đã cài Node.js, hãy chạy lệnh sau tại thư mục gốc của dự án:

```bash
npx http-server
```

Sau đó mở trình duyệt và truy cập vào địa chỉ được hiển thị (thường là `http://127.0.0.1:8080/example.html`).

### Cách 2: Python

Nếu bạn sử dụng Python:

```bash
# Python 3
python -m http.server 8000
```

Truy cập: `http://localhost:8000/example.html`

## 📂 Cấu Trúc Thư Mục

- **`example.html`**: Giao diện chính của ứng dụng.
- **`script.js`**: Logic cốt lõi (tải ảnh, quản lý bộ nhớ, vẽ UI).
- **`pipeline_steps.js`**: Định nghĩa các bước xử lý ảnh trong pipeline (Nơi bạn thêm/sửa logic OpenCV).
- **`opencv.js`**: Thư viện OpenCV phiên bản WebAssembly.
- **`img/`**: Thư mục chứa các ảnh mẫu.

## 📝 Cách Thêm Bước Xử Lý Mới

Mở file `pipeline_steps.js` và thêm một block `processBatchStep` mới:

```javascript
processBatchStep("Tên Bước Mới", (src) => {
    let dst = new cv.Mat();
    // Logic xử lý OpenCV của bạn, ví dụ: Threshold
    cv.threshold(src, dst, 177, 200, cv.THRESH_BINARY);
    return dst; // Trả về kết quả để dùng cho bước sau
});
```
