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
    'img/6.jpg'
];

const pipelineContainer = document.getElementById('pipeline-container');
const btnProcess = document.getElementById('btnProcess');
const btnViewResult = document.getElementById('btnViewResult');
const fileInput = document.getElementById('fileInput');

// Modal Elements
const modal = document.getElementById("resultModal");
const closeModalSpan = document.getElementsByClassName("close-modal")[0];
const resultGrid = document.getElementById("resultGrid");

// Khi chọn file, tự động kích hoạt xử lý
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        btnProcess.disabled = false;
        // Kiểm tra xem OpenCV đã sẵn sàng chưa trước khi tự động chạy
        if (typeof cv !== 'undefined' && cv.getBuildInformation) {
            btnProcess.click();
        } else {
            console.log("OpenCV is not ready, please wait...");
        }
    }
});

// Xử lý nút View Result
btnViewResult.addEventListener('click', () => {
    showFinalResult();
});

// Xử lý đóng Modal
closeModalSpan.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Phần xử lý sự kiện 'click' của btnProcess đã được chuyển sang file pipeline_steps.js
// để dễ dàng quản lý các bước xử lý ảnh.

// --- HÀM HỖ TRỢ ---

// Hàm load ảnh trả về Promise (để dùng await)
function loadAllImages(files) {
    const promises = files.map(file => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            // Xóa phần mở rộng file
            const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            img.onload = () => resolve({ img: img, name: name });
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
            // Lấy tên file từ URL và xóa phần mở rộng
            let name = url.split('/').pop();
            name = name.substring(0, name.lastIndexOf('.')) || name;
            img.onload = () => resolve({ img: img, name: name });
            img.onerror = reject;
        });
    });
    return Promise.all(promises);
}

// Tạo giao diện cho Hàng 1 và khởi tạo dữ liệu OpenCV
function initFirstRow(loadedImages) {
    const track = createStepRow("Original Images");

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

// Hàm hiển thị kết quả cuối cùng lên Modal Grid
function showFinalResult() {
    if (!currentMats || currentMats.length === 0) {
        alert("No results to display!");
        return;
    }

    resultGrid.innerHTML = ''; // Clear cũ

    currentMats.forEach((mat, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'image-item';

        const canvas = document.createElement('canvas');
        const canvasId = `modal-cv-${index}-${Date.now()}`;
        canvas.id = canvasId;

        wrapper.appendChild(canvas);

        const label = document.createElement('div');
        label.className = 'image-label';
        label.innerText = fileNames[index] || `Image ${index + 1}`;
        wrapper.appendChild(label);

        resultGrid.appendChild(wrapper);

        // Vẽ Mat lên Canvas (cần clone hoặc vẽ trực tiếp, ở đây dùng imshow vẽ trực tiếp)
        cv.imshow(canvasId, mat);
    });

    modal.style.display = "block";
}

// Hàm tạo khung HTML cho một hàng
function createStepRow(titleText) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'step-row';

    const title = document.createElement('div');
    title.className = 'step-title';

    // Nút toggle chi tiết
    const infoBtn = document.createElement('button');
    infoBtn.className = 'step-info-btn';
    infoBtn.innerHTML = 'ℹ️';
    infoBtn.title = "Click to toggle all title details";

    // Hàm thực hiện toggle cho tất cả
    const toggleAll = (e) => {
        if (e) e.stopPropagation();
        const isCurrentlyExpanded = title.classList.contains('expanded');
        const allTitles = document.querySelectorAll('.step-title');
        allTitles.forEach(t => {
            if (isCurrentlyExpanded) t.classList.remove('expanded');
            else t.classList.add('expanded');
        });
    };

    infoBtn.onclick = toggleAll;
    title.onclick = toggleAll; // Cho phép nhấn vào vùng tiêu đề để toggle
    title.appendChild(infoBtn);

    // Mặc định luôn mở rộng để dễ nhìn
    title.classList.add('expanded');

    // Lưu data-title để CSS tooltip dùng
    title.setAttribute('data-title', titleText);

    // Tạo span chứa text để hiện khi expanded
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title-text';
    titleSpan.innerText = titleText;
    title.appendChild(titleSpan);

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
        status.innerText = '🟢';
        status.style.color = 'green';

        // Luôn bật nút xử lý để có thể chạy lại
        btnProcess.disabled = false;

        // Tự động chạy với ảnh default khi mới vào
        console.log("Auto-running with default images...");
        // Dùng setTimeout để đảm bảo các file js khác đã load xong sự kiện
        setTimeout(() => {
            btnProcess.click();
        }, 100);
    }
};
