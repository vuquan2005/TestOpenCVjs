/**
 * OpenCV.js Type Definitions for Monaco Editor
 * Custom definitions for project TestOpenCVjs
 */

// ============ Core Types ============

declare interface Size {
    new (): Size;
    new (width: number, height: number): Size;
    width: number;
    height: number;
}

declare interface Point {
    new (): Point;
    new (x: number, y: number): Point;
    x: number;
    y: number;
}

declare interface Scalar {
    new (): Scalar;
    new (v0: number): Scalar;
    new (v0: number, v1: number): Scalar;
    new (v0: number, v1: number, v2: number): Scalar;
    new (v0: number, v1: number, v2: number, v3: number): Scalar;
    [index: number]: number;
}

declare interface Rect {
    new (): Rect;
    new (x: number, y: number, width: number, height: number): Rect;
    x: number;
    y: number;
    width: number;
    height: number;
}

declare interface Range {
    new (): Range;
    new (start: number, end: number): Range;
    start: number;
    end: number;
}

declare interface RotatedRect {
    new (): RotatedRect;
    new (center: Point, size: Size, angle: number): RotatedRect;
    center: Point;
    size: Size;
    angle: number;
    boundingRect(): Rect;
    points(): Point[];
}

declare interface TermCriteria {
    new (): TermCriteria;
    new (type: number, maxCount: number, epsilon: number): TermCriteria;
    type: number;
    maxCount: number;
    epsilon: number;
}

declare interface Moments {
    m00: number;
    m10: number;
    m01: number;
    m20: number;
    m11: number;
    m02: number;
    m30: number;
    m21: number;
    m12: number;
    m03: number;
    mu20: number;
    mu11: number;
    mu02: number;
    mu30: number;
    mu21: number;
    mu12: number;
    mu03: number;
    nu20: number;
    nu11: number;
    nu02: number;
    nu30: number;
    nu21: number;
    nu12: number;
    nu03: number;
}

// ============ Mat ============

declare interface Mat {
    new (): Mat;
    new (mat: Mat): Mat;
    new (rows: number, cols: number, type: number): Mat;
    new (rows: number, cols: number, type: number, scalar: Scalar): Mat;
    new (size: Size, type: number): Mat;
    new (size: Size, type: number, scalar: Scalar): Mat;
    
    /** Creates zeros matrix */
    zeros(rows: number, cols: number, type: number): Mat;
    zeros(size: Size, type: number): Mat;
    
    /** Creates ones matrix */
    ones(rows: number, cols: number, type: number): Mat;
    ones(size: Size, type: number): Mat;
    
    /** Creates identity matrix */
    eye(rows: number, cols: number, type: number): Mat;
    eye(size: Size, type: number): Mat;
    
    /** Number of rows */
    rows: number;
    /** Number of columns */
    cols: number;
    /** Matrix size [rows, cols] */
    matSize: number[];
    /** Matrix step */
    step: number[];
    
    /** Raw data access */
    data: Uint8Array;
    data8S: Int8Array;
    data16U: Uint16Array;
    data16S: Int16Array;
    data32S: Int32Array;
    data32F: Float32Array;
    data64F: Float64Array;
    
    /** Delete the Mat to free memory */
    delete(): void;
    /** Check if Mat is deleted */
    isDeleted(): boolean;
    
    /** Get Mat type */
    type(): number;
    /** Get Mat depth */
    depth(): number;
    /** Get number of channels */
    channels(): number;
    /** Get element size in bytes */
    elemSize(): number;
    /** Get element size per channel */
    elemSize1(): number;
    /** Check if empty */
    empty(): boolean;
    /** Get total number of elements */
    total(): number;
    /** Get normalized step */
    step1(): number;
    /** Check if continuous */
    isContinuous(): boolean;
    
    /** Clone the Mat */
    clone(): Mat;
    /** Copy to another Mat */
    copyTo(dst: Mat, mask?: Mat): void;
    /** Convert to another type */
    convertTo(m: Mat, rtype: number, alpha?: number, beta?: number): void;
    /** Set all elements to a value */
    setTo(s: Scalar, mask?: Mat): void;
    
    /** Create/reallocate Mat */
    create(rows: number, cols: number, type: number): void;
    create(size: Size, type: number): void;
    
    /** Get size */
    size(): Size;
    /** Get a row */
    row(y: number): Mat;
    /** Get a column */
    col(x: number): Mat;
    /** Get row range */
    rowRange(startrow: number, endrow: number): Mat;
    rowRange(r: Range): Mat;
    /** Get column range */
    colRange(startcol: number, endcol: number): Mat;
    colRange(r: Range): Mat;
    /** Get ROI (Region of Interest) */
    roi(rect: Rect): Mat;
    /** Get diagonal */
    diag(d?: number): Mat;
    
    /** Dot product */
    dot(m: Mat): number;
    /** Element-wise multiplication */
    mul(m: Mat, scale?: number): Mat;
    /** Matrix inverse */
    inv(method?: number): Mat;
    /** Matrix transpose */
    t(): Mat;
    
    /** Pointer access */
    ptr(i0: number, i1?: number): Uint8Array;
    ucharPtr(i0: number, i1?: number): Uint8Array;
    charPtr(i0: number, i1?: number): Int8Array;
    shortPtr(i0: number, i1?: number): Int16Array;
    ushortPtr(i0: number, i1?: number): Uint16Array;
    intPtr(i0: number, i1?: number): Int32Array;
    floatPtr(i0: number, i1?: number): Float32Array;
    doublePtr(i0: number, i1?: number): Float64Array;
    
    /** Element access */
    ucharAt(i0: number, i1?: number, i2?: number): number;
    charAt(i0: number, i1?: number, i2?: number): number;
    shortAt(i0: number, i1?: number, i2?: number): number;
    ushortAt(i0: number, i1?: number, i2?: number): number;
    intAt(i0: number, i1?: number, i2?: number): number;
    floatAt(i0: number, i1?: number, i2?: number): number;
    doubleAt(i0: number, i1?: number, i2?: number): number;
}

// ============ MatVector ============

declare interface MatVector {
    new (): MatVector;
    /** Get Mat at index */
    get(index: number): Mat;
    /** Set Mat at index */
    set(index: number, mat: Mat): void;
    /** Add Mat to end */
    push_back(mat: Mat): void;
    /** Get size */
    size(): number;
    /** Delete to free memory */
    delete(): void;
}

// ============ VideoCapture ============

declare interface VideoCapture {
    new (videoSource: string | HTMLVideoElement): VideoCapture;
    read(mat: Mat): void;
}

// ============ cv namespace ============

declare namespace cv {
    // Core constructors
    const Mat: Mat;
    const Size: Size;
    const Point: Point;
    const Scalar: Scalar;
    const Rect: Rect;
    const Range: Range;
    const RotatedRect: RotatedRect;
    const TermCriteria: TermCriteria;
    const MatVector: MatVector;
    const VideoCapture: VideoCapture;
    
    // ============ Data Types ============
    const CV_8U: number;
    const CV_8S: number;
    const CV_16U: number;
    const CV_16S: number;
    const CV_32S: number;
    const CV_32F: number;
    const CV_64F: number;
    const CV_8UC1: number;
    const CV_8UC2: number;
    const CV_8UC3: number;
    const CV_8UC4: number;
    const CV_8SC1: number;
    const CV_8SC2: number;
    const CV_8SC3: number;
    const CV_8SC4: number;
    const CV_16UC1: number;
    const CV_16UC2: number;
    const CV_16UC3: number;
    const CV_16UC4: number;
    const CV_16SC1: number;
    const CV_16SC2: number;
    const CV_16SC3: number;
    const CV_16SC4: number;
    const CV_32SC1: number;
    const CV_32SC2: number;
    const CV_32SC3: number;
    const CV_32SC4: number;
    const CV_32FC1: number;
    const CV_32FC2: number;
    const CV_32FC3: number;
    const CV_32FC4: number;
    const CV_64FC1: number;
    const CV_64FC2: number;
    const CV_64FC3: number;
    const CV_64FC4: number;
    
    // ============ Color Conversion ============
    const COLOR_BGR2BGRA: number;
    const COLOR_RGB2RGBA: number;
    const COLOR_BGRA2BGR: number;
    const COLOR_RGBA2RGB: number;
    const COLOR_BGR2RGBA: number;
    const COLOR_RGB2BGRA: number;
    const COLOR_RGBA2BGR: number;
    const COLOR_BGRA2RGB: number;
    const COLOR_BGR2RGB: number;
    const COLOR_RGB2BGR: number;
    const COLOR_BGRA2RGBA: number;
    const COLOR_RGBA2BGRA: number;
    const COLOR_BGR2GRAY: number;
    const COLOR_RGB2GRAY: number;
    const COLOR_GRAY2BGR: number;
    const COLOR_GRAY2RGB: number;
    const COLOR_GRAY2BGRA: number;
    const COLOR_GRAY2RGBA: number;
    const COLOR_BGRA2GRAY: number;
    const COLOR_RGBA2GRAY: number;
    const COLOR_BGR2HSV: number;
    const COLOR_RGB2HSV: number;
    const COLOR_HSV2BGR: number;
    const COLOR_HSV2RGB: number;
    const COLOR_BGR2HLS: number;
    const COLOR_RGB2HLS: number;
    const COLOR_HLS2BGR: number;
    const COLOR_HLS2RGB: number;
    const COLOR_BGR2Lab: number;
    const COLOR_RGB2Lab: number;
    const COLOR_Lab2BGR: number;
    const COLOR_Lab2RGB: number;
    const COLOR_BGR2Luv: number;
    const COLOR_RGB2Luv: number;
    const COLOR_Luv2BGR: number;
    const COLOR_Luv2RGB: number;
    const COLOR_BGR2YCrCb: number;
    const COLOR_RGB2YCrCb: number;
    const COLOR_YCrCb2BGR: number;
    const COLOR_YCrCb2RGB: number;
    const COLOR_BGR2YUV: number;
    const COLOR_RGB2YUV: number;
    const COLOR_YUV2BGR: number;
    const COLOR_YUV2RGB: number;
    const COLOR_BGR2HSV_FULL: number;
    const COLOR_RGB2HSV_FULL: number;
    const COLOR_HSV2BGR_FULL: number;
    const COLOR_HSV2RGB_FULL: number;
    
    // ============ Threshold Types ============
    const THRESH_BINARY: number;
    const THRESH_BINARY_INV: number;
    const THRESH_TRUNC: number;
    const THRESH_TOZERO: number;
    const THRESH_TOZERO_INV: number;
    const THRESH_MASK: number;
    const THRESH_OTSU: number;
    const THRESH_TRIANGLE: number;
    
    // ============ Adaptive Threshold Types ============
    const ADAPTIVE_THRESH_MEAN_C: number;
    const ADAPTIVE_THRESH_GAUSSIAN_C: number;
    
    // ============ Morphology ============
    const MORPH_RECT: number;
    const MORPH_CROSS: number;
    const MORPH_ELLIPSE: number;
    const MORPH_ERODE: number;
    const MORPH_DILATE: number;
    const MORPH_OPEN: number;
    const MORPH_CLOSE: number;
    const MORPH_GRADIENT: number;
    const MORPH_TOPHAT: number;
    const MORPH_BLACKHAT: number;
    const MORPH_HITMISS: number;
    
    // ============ Border Types ============
    const BORDER_CONSTANT: number;
    const BORDER_REPLICATE: number;
    const BORDER_REFLECT: number;
    const BORDER_WRAP: number;
    const BORDER_REFLECT_101: number;
    const BORDER_TRANSPARENT: number;
    const BORDER_DEFAULT: number;
    const BORDER_ISOLATED: number;
    
    // ============ Contour Retrieval Modes ============
    const RETR_EXTERNAL: number;
    const RETR_LIST: number;
    const RETR_CCOMP: number;
    const RETR_TREE: number;
    const RETR_FLOODFILL: number;
    
    // ============ Contour Approximation Modes ============
    const CHAIN_APPROX_NONE: number;
    const CHAIN_APPROX_SIMPLE: number;
    const CHAIN_APPROX_TC89_L1: number;
    const CHAIN_APPROX_TC89_KCOS: number;
    
    // ============ Line Types ============
    const FILLED: number;
    const LINE_4: number;
    const LINE_8: number;
    const LINE_AA: number;
    
    // ============ Font Types ============
    const FONT_HERSHEY_SIMPLEX: number;
    const FONT_HERSHEY_PLAIN: number;
    const FONT_HERSHEY_DUPLEX: number;
    const FONT_HERSHEY_COMPLEX: number;
    const FONT_HERSHEY_TRIPLEX: number;
    const FONT_HERSHEY_COMPLEX_SMALL: number;
    const FONT_HERSHEY_SCRIPT_SIMPLEX: number;
    const FONT_HERSHEY_SCRIPT_COMPLEX: number;
    const FONT_ITALIC: number;
    
    // ============ Interpolation Flags ============
    const INTER_NEAREST: number;
    const INTER_LINEAR: number;
    const INTER_CUBIC: number;
    const INTER_AREA: number;
    const INTER_LANCZOS4: number;
    const INTER_LINEAR_EXACT: number;
    const INTER_MAX: number;
    const WARP_FILL_OUTLIERS: number;
    const WARP_INVERSE_MAP: number;
    
    // ============ Norm Types ============
    const NORM_INF: number;
    const NORM_L1: number;
    const NORM_L2: number;
    const NORM_L2SQR: number;
    const NORM_HAMMING: number;
    const NORM_HAMMING2: number;
    const NORM_RELATIVE: number;
    const NORM_MINMAX: number;
    
    // ============ Decomposition Types ============
    const DECOMP_LU: number;
    const DECOMP_SVD: number;
    const DECOMP_EIG: number;
    const DECOMP_CHOLESKY: number;
    const DECOMP_QR: number;
    const DECOMP_NORMAL: number;
    
    // ============ Rotate Flags ============
    const ROTATE_90_CLOCKWISE: number;
    const ROTATE_180: number;
    const ROTATE_90_COUNTERCLOCKWISE: number;
    
    // ============ Distance Types ============
    const DIST_USER: number;
    const DIST_L1: number;
    const DIST_L2: number;
    const DIST_C: number;
    const DIST_L12: number;
    const DIST_FAIR: number;
    const DIST_WELSCH: number;
    const DIST_HUBER: number;
    
    // ============ TermCriteria Types ============
    const TERM_CRITERIA_COUNT: number;
    const TERM_CRITERIA_MAX_ITER: number;
    const TERM_CRITERIA_EPS: number;
    
    // ============ Hough Modes ============
    const HOUGH_STANDARD: number;
    const HOUGH_PROBABILISTIC: number;
    const HOUGH_MULTI_SCALE: number;
    const HOUGH_GRADIENT: number;
    
    // ============ Template Match Modes ============
    const TM_SQDIFF: number;
    const TM_SQDIFF_NORMED: number;
    const TM_CCORR: number;
    const TM_CCORR_NORMED: number;
    const TM_CCOEFF: number;
    const TM_CCOEFF_NORMED: number;
    
    // ============ ColorMap Types ============
    const COLORMAP_AUTUMN: number;
    const COLORMAP_BONE: number;
    const COLORMAP_JET: number;
    const COLORMAP_WINTER: number;
    const COLORMAP_RAINBOW: number;
    const COLORMAP_OCEAN: number;
    const COLORMAP_SUMMER: number;
    const COLORMAP_SPRING: number;
    const COLORMAP_COOL: number;
    const COLORMAP_HSV: number;
    const COLORMAP_PINK: number;
    const COLORMAP_HOT: number;
    const COLORMAP_PARULA: number;
    const COLORMAP_MAGMA: number;
    const COLORMAP_INFERNO: number;
    const COLORMAP_PLASMA: number;
    const COLORMAP_VIRIDIS: number;
    const COLORMAP_CIVIDIS: number;
    const COLORMAP_TWILIGHT: number;
    const COLORMAP_TURBO: number;
    
    // ============ JS Helper Functions ============
    
    /** Display a Mat on a canvas */
    function imshow(canvasId: string | HTMLCanvasElement, mat: Mat): void;
    
    /** Read an image from canvas/img element */
    function imread(imageSource: string | HTMLImageElement | HTMLCanvasElement): Mat;
    
    /** Create Mat from ImageData */
    function matFromImageData(imageData: ImageData): Mat;
    
    /** Create Mat from array */
    function matFromArray(rows: number, cols: number, type: number, array: number[]): Mat;
    
    /** Get OpenCV build information */
    function getBuildInformation(): string;
    
    /** Callback when OpenCV is ready */
    let onRuntimeInitialized: () => void;
    
    // ============ Core Array Operations ============
    
    /** Absolute difference */
    function absdiff(src1: Mat, src2: Mat, dst: Mat): void;
    
    /** Add two arrays */
    function add(src1: Mat, src2: Mat, dst: Mat, mask?: Mat, dtype?: number): void;
    
    /** Weighted sum of two arrays */
    function addWeighted(src1: Mat, alpha: number, src2: Mat, beta: number, gamma: number, dst: Mat, dtype?: number): void;
    
    /** Bitwise AND */
    function bitwise_and(src1: Mat, src2: Mat, dst: Mat, mask?: Mat): void;
    
    /** Bitwise NOT */
    function bitwise_not(src: Mat, dst: Mat, mask?: Mat): void;
    
    /** Bitwise OR */
    function bitwise_or(src1: Mat, src2: Mat, dst: Mat, mask?: Mat): void;
    
    /** Bitwise XOR */
    function bitwise_xor(src1: Mat, src2: Mat, dst: Mat, mask?: Mat): void;
    
    /** Compare two arrays */
    function compare(src1: Mat, src2: Mat, dst: Mat, cmpop: number): void;
    
    /** Convert scale absolute */
    function convertScaleAbs(src: Mat, dst: Mat, alpha?: number, beta?: number): void;
    
    /** Copy with border */
    function copyMakeBorder(src: Mat, dst: Mat, top: number, bottom: number, left: number, right: number, borderType: number, value?: Scalar): void;
    
    /** Copy to with mask */
    function copyTo(src: Mat, dst: Mat, mask: Mat): void;
    
    /** Count non-zero elements */
    function countNonZero(src: Mat): number;
    
    /** Determinant of matrix */
    function determinant(mtx: Mat): number;
    
    /** Divide two arrays */
    function divide(src1: Mat, src2: Mat, dst: Mat, scale?: number, dtype?: number): void;
    
    /** Calculate eigenvalues and eigenvectors */
    function eigen(src: Mat, eigenvalues: Mat, eigenvectors?: Mat): boolean;
    
    /** Exponential */
    function exp(src: Mat, dst: Mat): void;
    
    /** Extract channel */
    function extractChannel(src: Mat, dst: Mat, coi: number): void;
    
    /** Flip array */
    function flip(src: Mat, dst: Mat, flipCode: number): void;
    
    /** Generalized matrix multiplication */
    function gemm(src1: Mat, src2: Mat, alpha: number, src3: Mat, beta: number, dst: Mat, flags?: number): void;
    
    /** Horizontal concatenation */
    function hconcat(srcs: MatVector | Mat[], dst: Mat): void;
    
    /** Check if values are in range */
    function inRange(src: Mat, lowerb: Mat | Scalar, upperb: Mat | Scalar, dst: Mat): void;
    
    /** Insert channel */
    function insertChannel(src: Mat, dst: Mat, coi: number): void;
    
    /** Matrix inverse */
    function invert(src: Mat, dst: Mat, flags?: number): number;
    
    /** Natural logarithm */
    function log(src: Mat, dst: Mat): void;
    
    /** Look-up table transform */
    function LUT(src: Mat, lut: Mat, dst: Mat): void;
    
    /** Calculate magnitude */
    function magnitude(x: Mat, y: Mat, magnitude: Mat): void;
    
    /** Element-wise maximum */
    function max(src1: Mat, src2: Mat, dst: Mat): void;
    
    /** Calculate mean */
    function mean(src: Mat, mask?: Mat): Scalar;
    
    /** Calculate mean and standard deviation */
    function meanStdDev(src: Mat, mean: Mat, stddev: Mat, mask?: Mat): void;
    
    /** Merge channels */
    function merge(mv: MatVector, dst: Mat): void;
    
    /** Element-wise minimum */
    function min(src1: Mat, src2: Mat, dst: Mat): void;
    
    /** Min-max location */
    function minMaxLoc(src: Mat, mask?: Mat): { minVal: number; maxVal: number; minLoc: Point; maxLoc: Point };
    
    /** Multiply arrays */
    function multiply(src1: Mat, src2: Mat, dst: Mat, scale?: number, dtype?: number): void;
    
    /** Calculate norm */
    function norm(src1: Mat, normType?: number, mask?: Mat): number;
    function norm(src1: Mat, src2: Mat, normType?: number, mask?: Mat): number;
    
    /** Normalize array */
    function normalize(src: Mat, dst: Mat, alpha?: number, beta?: number, norm_type?: number, dtype?: number, mask?: Mat): void;
    
    /** Phase/angle of 2D vectors */
    function phase(x: Mat, y: Mat, angle: Mat, angleInDegrees?: boolean): void;
    
    /** Convert to polar coordinates */
    function cartToPolar(x: Mat, y: Mat, magnitude: Mat, angle: Mat, angleInDegrees?: boolean): void;
    
    /** Convert from polar coordinates */
    function polarToCart(magnitude: Mat, angle: Mat, x: Mat, y: Mat, angleInDegrees?: boolean): void;
    
    /** Raise to power */
    function pow(src: Mat, power: number, dst: Mat): void;
    
    /** Random fill */
    function randu(dst: Mat, low: number | Scalar, high: number | Scalar): void;
    function randn(dst: Mat, mean: number | Scalar, stddev: number | Scalar): void;
    
    /** Reduce array */
    function reduce(src: Mat, dst: Mat, dim: number, rtype: number, dtype?: number): void;
    
    /** Repeat array */
    function repeat(src: Mat, ny: number, nx: number, dst: Mat): void;
    
    /** Rotate array */
    function rotate(src: Mat, dst: Mat, rotateCode: number): void;
    
    /** Scale and add */
    function scaleAdd(src1: Mat, alpha: number, src2: Mat, dst: Mat): void;
    
    /** Set identity matrix */
    function setIdentity(mtx: Mat, s?: Scalar): void;
    
    /** Solve linear system */
    function solve(src1: Mat, src2: Mat, dst: Mat, flags?: number): boolean;
    
    /** Sort array */
    function sort(src: Mat, dst: Mat, flags: number): void;
    function sortIdx(src: Mat, dst: Mat, flags: number): void;
    
    /** Split channels */
    function split(m: Mat, mv: MatVector): void;
    
    /** Square root */
    function sqrt(src: Mat, dst: Mat): void;
    
    /** Subtract arrays */
    function subtract(src1: Mat, src2: Mat, dst: Mat, mask?: Mat, dtype?: number): void;
    
    /** Sum of elements */
    function sum(src: Mat): Scalar;
    
    /** Trace of matrix */
    function trace(mtx: Mat): Scalar;
    
    /** Matrix transpose */
    function transpose(src: Mat, dst: Mat): void;
    
    /** Vertical concatenation */
    function vconcat(srcs: MatVector | Mat[], dst: Mat): void;
    
    // ============ Image Processing ============
    
    /** Apply bilateral filter */
    function bilateralFilter(src: Mat, dst: Mat, d: number, sigmaColor: number, sigmaSpace: number, borderType?: number): void;
    
    /** Blur (average) */
    function blur(src: Mat, dst: Mat, ksize: Size, anchor?: Point, borderType?: number): void;
    
    /** Box filter */
    function boxFilter(src: Mat, dst: Mat, ddepth: number, ksize: Size, anchor?: Point, normalize?: boolean, borderType?: number): void;
    
    /** Build pyramid */
    function buildPyramid(src: Mat, dst: MatVector, maxlevel: number, borderType?: number): void;
    
    /** Canny edge detection */
    function Canny(image: Mat, edges: Mat, threshold1: number, threshold2: number, apertureSize?: number, L2gradient?: boolean): void;
    function Canny(dx: Mat, dy: Mat, edges: Mat, threshold1: number, threshold2: number, L2gradient?: boolean): void;
    
    /** Corner detection */
    function cornerHarris(src: Mat, dst: Mat, blockSize: number, ksize: number, k: number, borderType?: number): void;
    function cornerMinEigenVal(src: Mat, dst: Mat, blockSize: number, ksize?: number, borderType?: number): void;
    function goodFeaturesToTrack(image: Mat, corners: Mat, maxCorners: number, qualityLevel: number, minDistance: number, mask?: Mat, blockSize?: number, useHarrisDetector?: boolean, k?: number): void;
    
    /** Color conversion */
    function cvtColor(src: Mat, dst: Mat, code: number, dstCn?: number): void;
    
    /** Dilation */
    function dilate(src: Mat, dst: Mat, kernel: Mat, anchor?: Point, iterations?: number, borderType?: number, borderValue?: Scalar): void;
    
    /** Distance transform */
    function distanceTransform(src: Mat, dst: Mat, distanceType: number, maskSize: number, dstType?: number): void;
    function distanceTransformWithLabels(src: Mat, dst: Mat, labels: Mat, distanceType: number, maskSize: number, labelType?: number): void;
    
    /** Erosion */
    function erode(src: Mat, dst: Mat, kernel: Mat, anchor?: Point, iterations?: number, borderType?: number, borderValue?: Scalar): void;
    
    /** 2D filter */
    function filter2D(src: Mat, dst: Mat, ddepth: number, kernel: Mat, anchor?: Point, delta?: number, borderType?: number): void;
    
    /** Gaussian blur */
    function GaussianBlur(src: Mat, dst: Mat, ksize: Size, sigmaX: number, sigmaY?: number, borderType?: number): void;
    
    /** Get derivative kernels */
    function getDerivKernels(kx: Mat, ky: Mat, dx: number, dy: number, ksize: number, normalize?: boolean, ktype?: number): void;
    
    /** Get Gabor kernel */
    function getGaborKernel(ksize: Size, sigma: number, theta: number, lambd: number, gamma: number, psi?: number, ktype?: number): Mat;
    
    /** Get Gaussian kernel */
    function getGaussianKernel(ksize: number, sigma: number, ktype?: number): Mat;
    
    /** Get structuring element */
    function getStructuringElement(shape: number, ksize: Size, anchor?: Point): Mat;
    
    /** Laplacian */
    function Laplacian(src: Mat, dst: Mat, ddepth: number, ksize?: number, scale?: number, delta?: number, borderType?: number): void;
    
    /** Median blur */
    function medianBlur(src: Mat, dst: Mat, ksize: number): void;
    
    /** Morphology operations */
    function morphologyEx(src: Mat, dst: Mat, op: number, kernel: Mat, anchor?: Point, iterations?: number, borderType?: number, borderValue?: Scalar): void;
    
    /** Pyramid down */
    function pyrDown(src: Mat, dst: Mat, dstsize?: Size, borderType?: number): void;
    
    /** Pyramid up */
    function pyrUp(src: Mat, dst: Mat, dstsize?: Size, borderType?: number): void;
    
    /** Scharr derivative */
    function Scharr(src: Mat, dst: Mat, ddepth: number, dx: number, dy: number, scale?: number, delta?: number, borderType?: number): void;
    
    /** Separable filter */
    function sepFilter2D(src: Mat, dst: Mat, ddepth: number, kernelX: Mat, kernelY: Mat, anchor?: Point, delta?: number, borderType?: number): void;
    
    /** Sobel derivative */
    function Sobel(src: Mat, dst: Mat, ddepth: number, dx: number, dy: number, ksize?: number, scale?: number, delta?: number, borderType?: number): void;
    
    /** Spatial gradient */
    function spatialGradient(src: Mat, dx: Mat, dy: Mat, ksize?: number, borderType?: number): void;
    
    /** Square box filter */
    function sqrBoxFilter(src: Mat, dst: Mat, ddepth: number, ksize: Size, anchor?: Point, normalize?: boolean, borderType?: number): void;
    
    // ============ Thresholding ============
    
    /** Threshold */
    function threshold(src: Mat, dst: Mat, thresh: number, maxval: number, type: number): number;
    
    /** Adaptive threshold */
    function adaptiveThreshold(src: Mat, dst: Mat, maxValue: number, adaptiveMethod: number, thresholdType: number, blockSize: number, C: number): void;
    
    // ============ Geometric Transformations ============
    
    /** Affine transform */
    function warpAffine(src: Mat, dst: Mat, M: Mat, dsize: Size, flags?: number, borderMode?: number, borderValue?: Scalar): void;
    
    /** Perspective transform */
    function warpPerspective(src: Mat, dst: Mat, M: Mat, dsize: Size, flags?: number, borderMode?: number, borderValue?: Scalar): void;
    
    /** Resize */
    function resize(src: Mat, dst: Mat, dsize: Size, fx?: number, fy?: number, interpolation?: number): void;
    
    /** Remap */
    function remap(src: Mat, dst: Mat, map1: Mat, map2: Mat, interpolation: number, borderMode?: number, borderValue?: Scalar): void;
    
    /** Get rotation matrix */
    function getRotationMatrix2D(center: Point, angle: number, scale: number): Mat;
    
    /** Get affine transform matrix */
    function getAffineTransform(src: Mat | Point[], dst: Mat | Point[]): Mat;
    
    /** Get perspective transform matrix */
    function getPerspectiveTransform(src: Mat | Point[], dst: Mat | Point[]): Mat;
    
    /** Invert affine transform */
    function invertAffineTransform(M: Mat, iM: Mat): void;
    
    /** Get rect subpix */
    function getRectSubPix(image: Mat, patchSize: Size, center: Point, patch: Mat, patchType?: number): void;
    
    /** Log-polar transform */
    function logPolar(src: Mat, dst: Mat, center: Point, M: number, flags: number): void;
    
    /** Linear-polar transform */
    function linearPolar(src: Mat, dst: Mat, center: Point, maxRadius: number, flags: number): void;
    
    /** Warp polar */
    function warpPolar(src: Mat, dst: Mat, dsize: Size, center: Point, maxRadius: number, flags: number): void;
    
    // ============ Drawing Functions ============
    
    /** Draw circle */
    function circle(img: Mat, center: Point, radius: number, color: Scalar, thickness?: number, lineType?: number, shift?: number): void;
    
    /** Clip line */
    function clipLine(imgRect: Rect, pt1: Point, pt2: Point): boolean;
    
    /** Draw contours */
    function drawContours(image: Mat, contours: MatVector, contourIdx: number, color: Scalar, thickness?: number, lineType?: number, hierarchy?: Mat, maxLevel?: number, offset?: Point): void;
    
    /** Draw marker */
    function drawMarker(img: Mat, position: Point, color: Scalar, markerType?: number, markerSize?: number, thickness?: number, line_type?: number): void;
    
    /** Draw ellipse */
    function ellipse(img: Mat, center: Point, axes: Size, angle: number, startAngle: number, endAngle: number, color: Scalar, thickness?: number, lineType?: number, shift?: number): void;
    function ellipse(img: Mat, box: RotatedRect, color: Scalar, thickness?: number, lineType?: number): void;
    
    /** Draw filled convex polygon */
    function fillConvexPoly(img: Mat, points: Mat | Point[], color: Scalar, lineType?: number, shift?: number): void;
    
    /** Draw filled polygon */
    function fillPoly(img: Mat, pts: MatVector | Point[][], color: Scalar, lineType?: number, shift?: number, offset?: Point): void;
    
    /** Get text size */
    function getTextSize(text: string, fontFace: number, fontScale: number, thickness: number, baseLine: number[]): Size;
    
    /** Draw line */
    function line(img: Mat, pt1: Point, pt2: Point, color: Scalar, thickness?: number, lineType?: number, shift?: number): void;
    
    /** Draw arrowed line */
    function arrowedLine(img: Mat, pt1: Point, pt2: Point, color: Scalar, thickness?: number, line_type?: number, shift?: number, tipLength?: number): void;
    
    /** Draw polylines */
    function polylines(img: Mat, pts: MatVector | Point[][], isClosed: boolean, color: Scalar, thickness?: number, lineType?: number, shift?: number): void;
    
    /** Draw text */
    function putText(img: Mat, text: string, org: Point, fontFace: number, fontScale: number, color: Scalar, thickness?: number, lineType?: number, bottomLeftOrigin?: boolean): void;
    
    /** Draw rectangle */
    function rectangle(img: Mat, pt1: Point, pt2: Point, color: Scalar, thickness?: number, lineType?: number, shift?: number): void;
    function rectangle(img: Mat, rec: Rect, color: Scalar, thickness?: number, lineType?: number, shift?: number): void;
    
    // ============ Contours ============
    
    /** Find contours */
    function findContours(image: Mat, contours: MatVector, hierarchy: Mat, mode: number, method: number, offset?: Point): void;
    
    /** Contour area */
    function contourArea(contour: Mat, oriented?: boolean): number;
    
    /** Arc length / perimeter */
    function arcLength(curve: Mat, closed: boolean): number;
    
    /** Bounding rectangle */
    function boundingRect(points: Mat | Point[]): Rect;
    
    /** Minimum enclosing circle */
    function minEnclosingCircle(points: Mat | Point[]): { center: Point; radius: number };
    
    /** Minimum area rectangle */
    function minAreaRect(points: Mat | Point[]): RotatedRect;
    
    /** Fit ellipse */
    function fitEllipse(points: Mat | Point[]): RotatedRect;
    
    /** Fit line */
    function fitLine(points: Mat, line: Mat, distType: number, param: number, reps: number, aeps: number): void;
    
    /** Convex hull */
    function convexHull(points: Mat, hull: Mat, clockwise?: boolean, returnPoints?: boolean): void;
    
    /** Convexity defects */
    function convexityDefects(contour: Mat, convexhull: Mat, convexityDefects: Mat): void;
    
    /** Is contour convex */
    function isContourConvex(contour: Mat): boolean;
    
    /** Point polygon test */
    function pointPolygonTest(contour: Mat, pt: Point, measureDist: boolean): number;
    
    /** Approximate polygon */
    function approxPolyDP(curve: Mat, approxCurve: Mat, epsilon: number, closed: boolean): void;
    
    /** Match shapes */
    function matchShapes(contour1: Mat, contour2: Mat, method: number, parameter: number): number;
    
    /** Connected components */
    function connectedComponents(image: Mat, labels: Mat, connectivity?: number, ltype?: number): number;
    function connectedComponentsWithStats(image: Mat, labels: Mat, stats: Mat, centroids: Mat, connectivity?: number, ltype?: number): number;
    
    // ============ Histograms ============
    
    /** Calculate histogram */
    function calcHist(images: MatVector | Mat[], channels: number[], mask: Mat, hist: Mat, histSize: number[], ranges: number[], accumulate?: boolean): void;
    
    /** Calculate back projection */
    function calcBackProject(images: MatVector | Mat[], channels: number[], hist: Mat, backProject: Mat, ranges: number[], scale?: number): void;
    
    /** Compare histograms */
    function compareHist(H1: Mat, H2: Mat, method: number): number;
    
    /** Equalize histogram */
    function equalizeHist(src: Mat, dst: Mat): void;
    
    // ============ Image Moments ============
    
    /** Calculate moments */
    function moments(array: Mat, binaryImage?: boolean): Moments;
    
    /** Calculate Hu moments */
    function HuMoments(m: Moments, hu: Mat): void;
    
    // ============ Feature Detection ============
    
    /** Hough lines */
    function HoughLines(image: Mat, lines: Mat, rho: number, theta: number, threshold: number, srn?: number, stn?: number, min_theta?: number, max_theta?: number): void;
    
    /** Probabilistic Hough lines */
    function HoughLinesP(image: Mat, lines: Mat, rho: number, theta: number, threshold: number, minLineLength?: number, maxLineGap?: number): void;
    
    /** Hough circles */
    function HoughCircles(image: Mat, circles: Mat, method: number, dp: number, minDist: number, param1?: number, param2?: number, minRadius?: number, maxRadius?: number): void;
    
    // ============ Object Detection ============
    
    /** Template matching */
    function matchTemplate(image: Mat, templ: Mat, result: Mat, method: number, mask?: Mat): void;
    
    // ============ Image Segmentation ============
    
    /** Watershed */
    function watershed(image: Mat, markers: Mat): void;
    
    /** GrabCut */
    function grabCut(img: Mat, mask: Mat, rect: Rect, bgdModel: Mat, fgdModel: Mat, iterCount: number, mode?: number): void;
    
    // ============ Optical Flow ============
    
    /** Calculates optical flow using Lucas-Kanade method */
    function calcOpticalFlowPyrLK(prevImg: Mat, nextImg: Mat, prevPts: Mat, nextPts: Mat, status: Mat, err: Mat, winSize?: Size, maxLevel?: number, criteria?: TermCriteria, flags?: number, minEigThreshold?: number): void;
    
    /** Calculates dense optical flow using Farneback method */
    function calcOpticalFlowFarneback(prev: Mat, next: Mat, flow: Mat, pyr_scale: number, levels: number, winsize: number, iterations: number, poly_n: number, poly_sigma: number, flags: number): void;
    
    // ============ Color Maps ============
    
    /** Apply color map */
    function applyColorMap(src: Mat, dst: Mat, colormap: number): void;
    
    // ============ Utility ============
    
    /** Wait for key press (not applicable in browser) */
    function waitKey(delay?: number): number;
    
    /** Exception handling */
    function exceptionFromPtr(err: number): { msg: string; code: number; file: string; line: number; func: string };
}

// ============ Global Variables (Step Editor) ============

/** Source Mat variable (available in step editor) */
declare var src: Mat;

/** Destination Mat variable (available in step editor) */
declare var dst: Mat;

/** Step history array (available in step editor) */
declare var steps: Mat[];
