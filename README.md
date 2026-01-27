# TestOpenCVjs - Visual Image Processing Pipeline

[Tiếng Việt](./README_VN.md) | [English](./README.md)

A lightweight web application for experimenting with batch image processing using **OpenCV.js**. It provides a visual representation of each transformation step in a pipeline, making it ideal for debugging computer vision algorithms like Captcha solving or document processing.

**🌐 Live Demo:** [https://vuquan2005.github.io/TestOpenCVjs/](https://vuquan2005.github.io/TestOpenCVjs/)

## 🚀 Key Features

- **Batch Processing**: Apply a sequence of OpenCV operations to multiple images simultaneously.
- **Visual Pipeline**: Displays results of every processing step in rows, allowing side-by-side comparison across images.
- **Auto-Processing**: Automatically triggers processing upon page load (using default samples) or when new files are selected.
- **Memory Management**: Automatic cleanup of OpenCV `Mat` objects after each step to prevent memory leaks in the browser.
- **Flexible Input**:
    - Loads sample images from the `img/` directory by default.
    - Supports local file uploads via a custom file picker.
- **Final Results Modal**: A "View Results" button to inspect the final output of the entire pipeline in a clean grid layout.
- **Interactive UI**: Expandable/collapsible step titles with detailed information.

## 📦 Getting Started

The project is purely client-side; you only need a simple static web server to run it.

### Prerequisites

- [Node.js](https://nodejs.org/) (for `npx http-server`) OR [Python](https://www.python.org/)

### Running Locally

1. **Clone the repository:**

    ```bash
    git clone https://github.com/vuquan2005/TestOpenCVjs.git
    cd TestOpenCVjs
    ```

2. **Start a server:**

    **Using `npx` (Recommended):**

    ```bash
    npx http-server -c-1
    ```

    **Using Python:**

    ```bash
    python -m http.server 8000
    ```

3. **Access the app:**
   Open your browser and navigate to `http://localhost:8080` (or the port specified by your server).

## 📂 Project Structure

- **`index.html`**: The main entry point and UI layout.
- **`style.css`**: Premium, modern styling for the pipeline and controls.
- **`script.js`**: Core logic for image loading, pipeline management, and memory handling.
- **`pipeline_steps.js`**: The configuration file where processing steps are defined (e.g., HSV conversion, Thresholding).
- **`opencv.js`**: OpenCV library compiled to WebAssembly (WASM).
- **`img/`**: Directory containing sample images for default processing.

## 📝 Customizing the Pipeline

You can easily modify or add new processing steps in `pipeline_steps.js`. Each step is defined using the `processBatchStep` function:

```javascript
processBatchStep("Step Name", (src) => {
    let dst = new cv.Mat();
    // Your OpenCV logic here
    cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
    return dst; // Return the resulting Mat for the next step
});
```

### Current Pipeline Example (Captcha Processing)

The default `pipeline_steps.js` includes a robust sequence for cleaning noisy text:

1. **HSV Conversion**: Better color segmentation.
2. **Channel Selection**: Extracting the Saturation channel to highlight text.
3. **Median Blur**: Removing "salt and pepper" noise.
4. **Otsu Thresholding**: Optimal binarization.
5. **Blob Removal**: Custom contour filtering to remove remaining small noise particles.
6. **Morphological Closing**: Joining broken character segments.
7. **Bitwise Not**: Inverting for standard black-on-white output.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
