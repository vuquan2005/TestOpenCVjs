# TestOpenCVjs - Pipeline Xử Lý Ảnh Trực Quan

[Tiếng Việt](./README_VN.md) | [English](./README.md)

Một ứng dụng web nhẹ để thực nghiệm xử lý ảnh hàng loạt bằng **OpenCV.js**. Ứng dụng cung cấp cái nhìn trực quan về từng bước biến đổi trong một pipeline, cực kỳ phù hợp để debug các thuật toán thị giác máy tính như giải mã Captcha hoặc xử lý tài liệu.

**🌐 Live Demo:** [https://vuquan2005.github.io/TestOpenCVjs/](https://vuquan2005.github.io/TestOpenCVjs/)

## 🚀 Tính Năng Chính

- **Xử Lý Hàng Loạt (Batch Processing)**: Áp dụng một chuỗi các thao tác OpenCV cho nhiều ảnh cùng lúc.
- **Pipeline Trực Quan**: Hiển thị kết quả của mọi bước xử lý theo từng hàng, cho phép so sánh song song giữa các ảnh.
- **Tự Động Xử Lý**: Tự động kích hoạt xử lý khi tải trang (sử dụng ảnh mẫu mặc định) hoặc khi chọn file mới từ máy tính.
- **Quản Lý Bước Xử Lý Động**:
    - **Thêm/Sửa/Xóa Bước**: Thêm các bước xử lý mới trực tiếp trên trình duyệt với trình soạn thảo code.
    - **Sắp Xếp Lại Bước**: Di chuyển các bước lên hoặc xuống trong quy trình.
    - **Lưu Trữ**: Các bước tùy chỉnh của bạn được lưu tự động vào Local Storage của trình duyệt.
- **Quản Lý Bộ Nhớ**: Tự động giải phóng các đối tượng `Mat` của OpenCV sau mỗi bước để tránh rò rỉ bộ nhớ.
- **Đầu Vào Linh Hoạt**:
    - Mặc định tải các ảnh mẫu từ thư mục `img/`.
    - Hỗ trợ tải ảnh local thông qua bộ chọn tệp tùy chỉnh.
- **Xem Kết Quả Cuối**: Nút "View Results" giúp kiểm tra đầu ra cuối cùng của toàn bộ pipeline trong một lưới giao diện sạch sẽ.
- **Khả Năng Reset**: Dễ dàng khôi phục pipeline về trạng thái mặc định, xóa mọi tùy chỉnh cục bộ.

## 📦 Bắt Đầu

Dự án sử dụng ES Modules, do đó bạn cần một static web server đơn giản để chạy nó (giao thức file:// sẽ không hoạt động).

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
- **`style.css`**: Định dạng giao diện cho ứng dụng.
- **`opencv.js`**: Thư viện OpenCV đã được biên dịch sang WebAssembly (WASM).
- **`js/`**:
    - **`main.js`**: Điểm khởi chạy ứng dụng, khởi tạo các thành phần.
    - **`core/`**:
        - **`PipelineManager.js`**: Xử lý tải ảnh và logic thực thi pipeline.
        - **`StepManager.js`**: Quản lý danh sách các bước xử lý (Thêm/Sửa/Xóa, sắp xếp, lưu trữ).
    - **`ui/`**:
        - **`UIManager.js`**: Xử lý hiển thị trực quan của pipeline.
        - **`SettingsUI.js`**: Quản lý modal chỉnh sửa bước.
    - **`steps/`**:
        - **`defaultSteps.js`**: Định nghĩa các bước xử lý khởi tạo/mặc định.
- **`img/`**: Thư mục chứa các ảnh mẫu.

## 📝 Tùy Chỉnh Pipeline

### Thông qua Giao Diện (Khuyên dùng)

Bạn có thể sửa đổi pipeline trực tiếp trên giao diện web:

1. Nhấn **"+ Add New Step"** để thêm một thao tác OpenCV tùy chỉnh.
2. Nhấn biểu tượng **Edit** (cây bút) trên một bước hiện có để sửa code.
3. Sử dụng các mũi tên **Lên/Xuống** để sắp xếp lại vị trí các bước.
4. Sử dụng biểu tượng **Delete** (thùng rác) để xóa một bước.

Các thay đổi của bạn được lưu tự động. Để quay lại pipeline gốc, nhấn nút **Reset** trên thanh tiêu đề.

### Thêm Các Bước Mặc Định

Để thêm vĩnh viễn các bước vào cấu hình mặc định, hãy chỉnh sửa file `js/steps/defaultSteps.js`. Mỗi bước là một object với `id`, `name`, và hàm `process`:

```javascript
{
    id: "step-unique-id",
    name: "Tên Bước",
    process: (src) => {
        let dst = new cv.Mat();
        // Logic OpenCV của bạn ở đây
        cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
        return dst; // Trả về kết quả cho bước tiếp theo
    }
}
```

### Pipeline Mặc Định Hiện Tại (Xử Lý Captcha)

Cấu hình mặc định trong `js/steps/defaultSteps.js` bao gồm một chuỗi xử lý để làm sạch văn bản nhiễu:

1. **Chuyển đổi HSV**: Phân đoạn màu sắc tốt hơn.
2. **Chọn Kênh Màu**: Trích xuất kênh Saturation.
3. **Median Blur**: Loại bỏ nhiễu.
4. **Otsu Thresholding**: Nhị phân hóa tối ưu.
5. **Loại Bỏ Blob**: Lọc các hạt nhiễu nhỏ.
6. **Morphological Closing**: Nối các đoạn bị đứt.
7. **Bitwise Not**: Đảo ngược màu cho đầu ra tiêu chuẩn.

## 📄 Giấy Phép

Dự án này được cấp phép theo Giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
