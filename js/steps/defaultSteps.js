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
        name: "remove small blobs",
        // prettier-ignore
        process: (src) => {
src.copyTo(dst);
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();

cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);


let maxArea = 0;
for (let i = 0; i < contours.size(); i++) {
    let area = cv.contourArea(contours.get(i));
    if (area > maxArea) maxArea = area;
}

let dynamicThreshold = maxArea * 0.15;
if (dynamicThreshold < 80) dynamicThreshold = 80;

for (let i = 0; i < contours.size(); i++) {
    let c = contours.get(i);
    let area = cv.contourArea(c);
    let rect = cv.boundingRect(c);

    let height = rect.height;
    let width = rect.width;


    let aspectRatio = width / height;

    let isTrash = area < dynamicThreshold || height < 10;

    let isSkinnyChar = height > 12 && aspectRatio < 0.4;

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

let kernel = cv.getStructuringElement(
    cv.MORPH_RECT,
    new cv.Size(3, 2)
);


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
