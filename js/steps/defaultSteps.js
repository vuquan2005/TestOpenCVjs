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
        name: "morph open",
        // prettier-ignore
        process: (src) => {
let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
cv.morphologyEx(src, dst, cv.MORPH_OPEN, kernel);
kernel.delete();
        },
    },
    {
        name: "save 5 big blobs",
        // prettier-ignore
        process: (src, steps) => {
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();

cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

// Phân loại contours
let stems = [];      // Ký tự cao, hẹp (có thể là i, j, l, 1...)
let candidates = []; // Ứng viên dấu chấm
let allItems = [];

for (let i = 0; i < contours.size(); i++) {
    let c = contours.get(i);
    let area = cv.contourArea(c);
    let rect = cv.boundingRect(c);
    
    let item = {
        id: i,
        area: area,
        cx: rect.x + rect.width / 2,
        y: rect.y,
        h: rect.height,
        w: rect.width
    };
    
    allItems.push(item);

    let aspectRatio = rect.width / rect.height;
    if (area > 50 && aspectRatio < 0.6) {
        stems.push(item);
    } else if (area > 10 && area < 200) {
        candidates.push(item);
    }
    
    c.delete();
}

// Giữ lại Top 5 vùng lớn nhất
allItems.sort((a, b) => b.area - a.area);
let indicesToKeep = new Set();
for (let i = 0; i < Math.min(5, allItems.length); i++) {
    indicesToKeep.add(allItems[i].id);
}

// Tìm dấu chấm nằm phía trên các ký tự cao (i, j)
for (let stem of stems) {
    for (let dot of candidates) {
        let xDiff = Math.abs(stem.cx - dot.cx);
        let xLimit = Math.max(stem.w, 10);
        let distY = stem.y - (dot.y + dot.h);
        
        if (xDiff < xLimit && dot.y < stem.y && distY < 35 && distY > -5) {
            indicesToKeep.add(dot.id);
        }
    }
}

// Tạo mask từ các contour được chọn, sau đó copy pixel gốc
let tempMask = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);

for (let i = 0; i < contours.size(); i++) {
    if (indicesToKeep.has(i)) {
        cv.drawContours(tempMask, contours, i, new cv.Scalar(255), -1);
    }
}

dst.setTo(new cv.Scalar(0));
src.copyTo(dst, tempMask);

tempMask.delete();
contours.delete();
hierarchy.delete();
        },
    },
    {
        name: "morph close",
        // prettier-ignore
        process: (src) => {
let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 2));
cv.morphologyEx(src, dst, cv.MORPH_CLOSE, kernel);
kernel.delete();
        },
    },
    {
        name: "save s channel data",
        // prettier-ignore
        process: (src, steps) => {
// Lấy S channel gốc (steps[2]), dùng mask hiện tại (src) để cắt
let graySource = steps[2];
dst.setTo(new cv.Scalar(0));
graySource.copyTo(dst, src);
        },
    },
];
