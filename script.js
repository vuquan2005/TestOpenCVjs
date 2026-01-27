// --- QUẢN LÝ BỘ NHỚ & MAT ---
// Chúng ta cần lưu trữ mảng Mat của bước hiện tại để dùng cho bước sau
let currentMats = [];
let fileNames = []; // Lưu tên file để hiển thị cho đẹp
const DEFAULT_IMAGES = [
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg'
];

const pipelineContainer = document.getElementById('pipeline-container');
const btnProcess = document.getElementById('btnProcess');
const fileInput = document.getElementById('fileInput');

// Khi chọn file, bật nút xử lý
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) btnProcess.disabled = false;
});

// Phần xử lý sự kiện 'click' của btnProcess đã được chuyển sang file pipeline_steps.js
// để dễ dàng quản lý các bước xử lý ảnh.

// --- HÀM HỖ TRỢ ---

// Hàm load ảnh trả về Promise (để dùng await)
function loadAllImages(files) {
    const promises = files.map(file => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => resolve({ img: img, name: file.name });
            img.onerror = reject;
        });
    });
    return Promise.all(promises);
}

// Hàm load ảnh từ URL (cho ảnh default trong folder img/)
function loadImagesFromUrls(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            // Lấy tên file từ URL để hiển thị
            const name = url.split('/').pop();
            img.onload = () => resolve({ img: img, name: name });
            img.onerror = reject;
        });
    });
    return Promise.all(promises);
}

// Tạo giao diện cho Hàng 1 và khởi tạo dữ liệu OpenCV
function initFirstRow(loadedImages) {
    const track = createStepRow("Ảnh gốc");

    loadedImages.forEach((item, index) => {
        // 1. Hiển thị UI
        const wrapper = document.createElement('div');
        wrapper.className = 'image-item';

        const imgClone = item.img.cloneNode(true);
        wrapper.appendChild(imgClone);

        const label = document.createElement('div');
        label.className = 'image-label';
        label.innerText = item.name;
        wrapper.appendChild(label);

        track.appendChild(wrapper);

        // 2. Khởi tạo OpenCV Mat
        let mat = cv.imread(item.img);
        currentMats.push(mat);
        fileNames.push(item.name);
    });
}

// Hàm xử lý hàng loạt
function processBatchStep(stepName, processCallback) {
    const track = createStepRow(stepName);
    let nextMats = []; // Mảng chứa kết quả của bước này

    // Duyệt qua từng Mat của bước trước
    for (let i = 0; i < currentMats.length; i++) {
        let srcMat = currentMats[i];

        // --- XỬ LÝ ẢNH ---
        let dstMat = processCallback(srcMat);
        nextMats.push(dstMat); // Lưu vào mảng mới

        // --- HIỂN THỊ UI ---
        const wrapper = document.createElement('div');
        wrapper.className = 'image-item';

        const canvas = document.createElement('canvas');
        // Tạo ID ngẫu nhiên để tránh trùng
        const canvasId = `cv-${stepName.replace(/\s/g, '')}-${i}-${Date.now()}`;
        canvas.id = canvasId;

        wrapper.appendChild(canvas);

        // Label (giữ nguyên tên file để dễ so sánh cột dọc)
        const label = document.createElement('div');
        label.className = 'image-label';
        label.innerText = fileNames[i];
        wrapper.appendChild(label);

        track.appendChild(wrapper);

        // Vẽ Mat lên Canvas
        cv.imshow(canvasId, dstMat);
    }

    // --- DỌN DẸP BỘ NHỚ ---
    // Xóa các Mat của bước CŨ để giải phóng RAM
    currentMats.forEach(mat => mat.delete());

    // Cập nhật mảng hiện tại thành mảng mới
    currentMats = nextMats;
}

// Hàm tạo khung HTML cho một hàng
function createStepRow(titleText) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'step-row';

    const title = document.createElement('div');
    title.className = 'step-title';

    title.innerHTML = 'ℹ️';
    title.setAttribute('data-title', titleText);
    rowDiv.appendChild(title);

    const trackDiv = document.createElement('div');
    trackDiv.className = 'images-track';
    rowDiv.appendChild(trackDiv);

    pipelineContainer.appendChild(rowDiv);
    return trackDiv; // Trả về nơi chứa ảnh để append vào
}

var Module = {
    onRuntimeInitialized() {
        const status = document.getElementById('status');
        status.innerText = '🟢 OpenCV.js (Sẵn sàng)';
        status.style.color = 'green';

        // Bật nút xử lý vì luôn có ảnh default
        btnProcess.disabled = false;

        // Tự động chạy với ảnh default khi mới vào
        console.log("Auto-running with default images...");
        // Dùng setTimeout để đảm bảo các file js khác đã load xong sự kiện
        setTimeout(() => {
            btnProcess.click();
        }, 100);
    }
};
