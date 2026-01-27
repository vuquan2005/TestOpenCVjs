btnProcess.addEventListener('click', async () => {
    pipelineContainer.innerHTML = '';
    currentMats.forEach(mat => mat.delete());
    currentMats = [];
    fileNames = [];
    const files = Array.from(fileInput.files);
    let loadedImages = [];
    if (files.length > 0) loadedImages = await loadAllImages(files);
    else loadedImages = await loadImagesFromUrls(DEFAULT_IMAGES);
    if (loadedImages.length === 0) return;
    initFirstRow(loadedImages); // Load ảnh ban đầu
    // Để thêm bước mới, chỉ cần copy block processBatchStep ở trên và thay đổi logic xử lý OpenCV bên trong.
    /*
    processBatchStep("Tên Bước Mới", (src) => {
        let dst = new cv.Mat();
        // Viết logic OpenCV tại đây, ví dụ: cv.threshold(...)
        return dst;
    });
    */

    processBatchStep("hsv", (src) => {
        let dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGB2HSV);
        return dst;
    });

    processBatchStep("get channel s", (src) => {
        let channels = new cv.MatVector();
        cv.split(src, channels);
        // Kênh S thường chứa thông tin tốt nhất cho loại captcha này
        let sChannel = channels.get(1);
        channels.delete(); // Giải phóng bộ nhớ vector
        return sChannel;
    });

    // --- THAY ĐỔI 1: Dùng Median Blur để khử nhiễu đốm ---
    processBatchStep("median blur", (src) => {
        let dst = new cv.Mat();
        // Ksize = 3 hoặc 5. Với nhiễu nhiều như ảnh mẫu, thử 5 sẽ sạch hơn
        cv.medianBlur(src, dst, 3);
        return dst;
    });

    processBatchStep("otsu", (src) => {
        let dst = new cv.Mat();
        cv.threshold(
            src,
            dst,
            0,
            255,
            cv.THRESH_BINARY + cv.THRESH_OTSU
        );
        return dst;
    });

    // --- THAY ĐỔI 2: Loại bỏ nhiễu TRƯỚC khi Morph để tránh làm nhiễu to ra ---
    processBatchStep("remove small blobs", (src) => {
        let dst = src.clone();
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();

        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // 1. Tìm Max Area
        let maxArea = 0;
        for (let i = 0; i < contours.size(); i++) {
            let area = cv.contourArea(contours.get(i));
            if (area > maxArea) maxArea = area;
        }

        // Giảm ngưỡng an toàn xuống chút (0.2 -> 0.15) để đỡ xóa nhầm
        let dynamicThreshold = maxArea * 0.15;
        if (dynamicThreshold < 80) dynamicThreshold = 80; // Sàn tối thiểu

        for (let i = 0; i < contours.size(); i++) {
            let c = contours.get(i);
            let area = cv.contourArea(c);
            let rect = cv.boundingRect(c);

            let height = rect.height;
            let width = rect.width;

            // Tính tỷ lệ khung hình (Chiều rộng / Chiều cao)
            let aspectRatio = width / height;

            // --- CÁC ĐIỀU KIỆN ---

            // 1. Nó có phải là rác không? (Nhỏ HOẶC Lùn)
            let isTrash = (area < dynamicThreshold) || (height < 10);

            // 2. NGOẠI LỆ: "Cơ chế bảo vệ người gầy" (Quan trọng cho chữ i, l, 1)
            // Nếu nó đủ cao (> 12px) VÀ nó thon dài (ratio < 0.4) -> Đừng xóa!
            let isSkinnyChar = (height > 12) && (aspectRatio < 0.4);

            // Logic: Nếu là rác VÀ KHÔNG PHẢI là chữ gầy -> Xóa
            if (isTrash && !isSkinnyChar) {
                cv.drawContours(dst, contours, i, new cv.Scalar(0), -1);
            }

            c.delete();
        }

        contours.delete();
        hierarchy.delete();
        return dst;
    });

    // --- THAY ĐỔI 3: Dùng Morph Close để nối liền nét chữ ---
    // (Bỏ qua Morph Open vì Median Blur đã làm sạch nhiễu rồi)
    processBatchStep("morph close", (src) => {
        let dst = new cv.Mat();

        // Kernel hình chữ nhật nằm ngang giúp nối các nét đứt tốt hơn cho chữ viết tay
        let kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(3, 2)
        );

        // Morph Close = Dilate -> Erode (Lấp đầy lỗ hổng bên trong chữ)
        cv.morphologyEx(src, dst, cv.MORPH_CLOSE, kernel);

        kernel.delete();
        return dst;
    });

    processBatchStep("bitwise not", (src) => {
        let dst = new cv.Mat();
        cv.bitwise_not(src, dst);
        return dst;
    });

});
