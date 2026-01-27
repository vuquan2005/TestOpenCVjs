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

    processBatchStep("Chuyển sang ảnh xám", (src) => {
        let dst = new cv.Mat();
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        return dst;
    });

    processBatchStep("Làm mờ (Gaussian Blur)", (src) => {
        let dst = new cv.Mat();
        cv.GaussianBlur(src, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
        return dst;
    });

    processBatchStep("Phát hiện cạnh (Canny)", (src) => {
        let dst = new cv.Mat();
        cv.Canny(src, dst, 50, 100);
        return dst;
    });
});
