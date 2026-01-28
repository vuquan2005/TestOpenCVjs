export const steps = [
    {
        name: "hsv",
        // prettier-ignore
        process: (src) => {
cv.cvtColor(src, dst, cv.COLOR_RGB2HSV);
        },
    },
    {
        name: "get channel s",
        // prettier-ignore
        process: (src) => {
let channels = new cv.MatVector();
cv.split(src, channels);
// Kênh S thường chứa thông tin tốt nhất cho loại captcha này
dst = channels.get(1);
channels.delete();
        },
    },
    {
        name: "otsu",
        // prettier-ignore
        process: (src) => {
cv.threshold(src, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);
        },
    },
    {
        name: "remove small blobs",
        // prettier-ignore
        process: (src) => {
src.copyTo(dst); // Copy src to dst initially
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
    let isTrash = area < dynamicThreshold || height < 10;

    // 2. NGOẠI LỆ: "Cơ chế bảo vệ người gầy" (Quan trọng cho chữ i, l, 1)
    // Nếu nó đủ cao (> 12px) VÀ nó thon dài (ratio < 0.4) -> Đừng xóa!
    let isSkinnyChar = height > 12 && aspectRatio < 0.4;

    // Logic: Nếu là rác VÀ KHÔNG PHẢI là chữ gầy -> Xóa
    if (isTrash && !isSkinnyChar) {
        cv.drawContours(dst, contours, i, new cv.Scalar(0), -1);
    }

    c.delete();
}

contours.delete();
hierarchy.delete();
        },
    },
    {
        name: "morph close",
        // prettier-ignore
        process: (src) => {
// Kernel hình chữ nhật nằm ngang giúp nối các nét đứt tốt hơn cho chữ viết tay
let kernel = cv.getStructuringElement(
    cv.MORPH_RECT,
    new cv.Size(3, 2)
);

// Morph Close = Dilate -> Erode (Lấp đầy lỗ hổng bên trong chữ)
cv.morphologyEx(src, dst, cv.MORPH_CLOSE, kernel);

kernel.delete();
        },
    },
    {
        name: "bitwise not",
        // prettier-ignore
        process: (src) => {
cv.bitwise_not(src, dst);
        },
    },
];
