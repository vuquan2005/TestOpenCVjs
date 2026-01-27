# TestOpenCVjs - Pipeline Xử Lý Ảnh Trực Quan

[Tiếng Việt](./README_VN.md) | [English](./README.md)

Một ứng dụng web nhẹ để thực nghiệm xử lý ảnh hàng loạt bằng **OpenCV.js**. Ứng dụng cung cấp cái nhìn trực quan về từng bước biến đổi trong một pipeline, cực kỳ phù hợp để debug các thuật toán thị giác máy tính như giải mã Captcha hoặc xử lý tài liệu.

**🌐 Live Demo:** [https://vuquan2005.github.io/TestOpenCVjs/](https://vuquan2005.github.io/TestOpenCVjs/)

## 🚀 Tính Năng Chính

- **Xử Lý Hàng Loạt (Batch Processing)**: Áp dụng một chuỗi các thao tác OpenCV cho nhiều ảnh cùng lúc.
- **Pipeline Trực Quan**: Hiển thị kết quả của mọi bước xử lý theo từng hàng, cho phép so sánh song song giữa các ảnh.
- **Tự Động Xử Lý**: Tự động kích hoạt xử lý khi tải trang (sử dụng ảnh mẫu mặc định) hoặc khi chọn file mới từ máy tính.
- **Quản Lý Bộ Nhớ**: Tự động giải phóng các đối tượng `Mat` của OpenCV sau mỗi bước để tránh rò rỉ bộ nhớ trên trình duyệt.
- **Đầu Vào Linh Hoạt**:
    - Mặc định tải các ảnh mẫu từ thư mục `img/`.
    - Hỗ trợ tải ảnh local thông qua bộ chọn tệp tùy chỉnh.
- **Xem Kết Quả Cuối**: Nút "View Results" giúp kiểm tra đầu ra cuối cùng của toàn bộ pipeline trong một lưới giao diện sạch sẽ.
- **Giao Diện Tương Tác**: Tiêu đề các bước có thể thu gọn/mở rộng với thông tin chi tiết.

## 📦 Bắt Đầu

Dự án hoàn toàn chạy ở phía client; bạn chỉ cần một static web server đơn giản để khởi chạy.

### Yêu Cầu

- [Node.js](https://nodejs.org/) (để dùng `npx http-server`) HOẶC [Python](https://www.python.org/)

### Chạy Local

1. **Clone repository:**

    ```bash
    git clone https://github.com/vuquan2005/TestOpenCVjs.git
    cd TestOpenCVjs
    ```

2. **Khởi động server:**

    **Sử dụng `npx` (Khuyên dùng):**

    ```bash
    npx http-server -c-1
    ```

    **Sử dụng Python:**

    ```bash
    python -m http.server 8000
    ```

3. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập `http://localhost:8080` (hoặc cổng mà server của bạn chỉ định).

## 📂 Cấu Trúc Dự Án

- **`index.html`**: Điểm vào chính và bố cục giao diện.
- **`style.css`**: Định dạng phong cách hiện đại cho pipeline và các nút điều khiển.
- **`script.js`**: Logic cốt lõi để tải ảnh, quản lý pipeline và xử lý bộ nhớ.
- **`pipeline_steps.js`**: File cấu hình nơi định nghĩa các bước xử lý (ví dụ: chuyển đổi HSV, Threshold).
- **`opencv.js`**: Thư viện OpenCV đã được biên dịch sang WebAssembly (WASM).
- **`img/`**: Thư mục chứa các ảnh mẫu để xử lý mặc định.

## 📝 Tùy Chỉnh Pipeline

Bạn có thể dễ dàng sửa đổi hoặc thêm các bước xử lý mới trong `pipeline_steps.js`. Mỗi bước được định nghĩa bằng hàm `processBatchStep`:

```javascript
processBatchStep("Tên Bước", (src) => {
    let dst = new cv.Mat();
    // Logic OpenCV của bạn tại đây
    cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
    return dst; // Trả về Mat kết quả cho bước tiếp theo
});
```

### Ví Dụ Pipeline Hiện Tại (Xử Lý Captcha)

File `pipeline_steps.js` mặc định bao gồm một chuỗi các bước mạnh mẽ để làm sạch văn bản bị nhiễu:

1. **Chuyển đổi HSV**: Phân đoạn màu sắc tốt hơn.
2. **Chọn Kênh Màu**: Trích xuất kênh Saturation để làm nổi bật văn bản.
3. **Median Blur**: Loại bỏ nhiễu "muối tiêu".
4. **Otsu Thresholding**: Nhị phân hóa tối ưu.
5. **Loại Bỏ Blob**: Lọc contour tùy chỉnh để xóa các hạt nhiễu nhỏ còn lại.
6. **Morphological Closing**: Nối các nét chữ bị đứt quãng.
7. **Bitwise Not**: Đảo ngược màu để có kết quả văn bản đen trên nền trắng tiêu chuẩn.

## 📄 Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
