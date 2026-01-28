# TestOpenCVjs - Visual Image Processing Pipeline

[Tiếng Việt](./README_VN.md) | [English](./README.md)

A lightweight web application for experimenting with batch image processing using **OpenCV.js**. It provides a visual representation of each transformation step in a pipeline, making it ideal for debugging computer vision algorithms like Captcha solving or document processing.

**🌐 Live Demo:** [https://vuquan2005.github.io/TestOpenCVjs/](https://vuquan2005.github.io/TestOpenCVjs/)

## 🚀 Key Features

- **Batch Processing**: Apply a sequence of OpenCV operations to multiple images simultaneously.
- **Visual Pipeline**: Displays results of every processing step in rows, allowing side-by-side comparison across images.
- **Auto-Processing**: Automatically triggers processing upon page load (using default samples) or when new files are selected.
- **Dynamic Step Management**:
    - **Add/Edit/Delete Steps**: Add new processing steps directly in the browser with a code editor.
    - **Reorder Steps**: Move steps up or down the pipeline.
    - **Persistence**: Your custom pipeline steps are saved in the browser's Local Storage.
- **Memory Management**: Automatic cleanup of OpenCV `Mat` objects after each step to prevent memory leaks in the browser.
- **Flexible Input**:
    - Loads sample images from the `img/` directory by default.
    - Supports local file uploads via a custom file picker.
- **Final Results**: A "View Results" button to inspect the final output of the entire pipeline in a clean grid layout.
- **Reset Capability**: Easily reset the pipeline to its default state, clearing any local customizations.

## 📦 Getting Started

The project uses ES Modules, so you need a simple static web server to run it locally (file:// protocol won't work).

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
- **`style.css`**: Styling for the application.
- **`opencv.js`**: OpenCV library compiled to WebAssembly (WASM).
- **`js/`**:
    - **`main.js`**: Application entry point, initializes components.
    - **`core/`**:
        - **`PipelineManager.js`**: Handles image loading and pipeline execution logic.
        - **`StepManager.js`**: Manages the list of processing steps (CRUD, reordering, local storage).
    - **`ui/`**:
        - **`UIManager.js`**: Handles rendering of the pipeline visualization.
        - **`SettingsUI.js`**: Manages the step editor modal.
    - **`steps/`**:
        - **`defaultSteps.js`**: Defines the initial/default processing steps.
- **`img/`**: Directory containing sample images for default processing.

## 📝 Customizing the Pipeline

### Through the UI (Recommended)

You can modify the pipeline directly in the web interface:

1. Click **"+ Add New Step"** to add a custom OpenCV operation.
2. Click the **Edit** (pencil) icon on an existing step to modify its code.
3. Use the **Up/Down** arrows to reorder steps.
4. Use the **Delete** (trash) icon to remove a step.

Your changes are saved automatically to the browser's Local Storage. To revert to the original pipeline, click the **Reset** button in the header.

### Adding Default Steps

To permanently add steps to the default configuration, edit `js/steps/defaultSteps.js`. Each step is an object with an `id`, `name`, and a `process` function:

```javascript
{
    id: "step-unique-id",
    name: "Step Name",
    process: (src) => {
        let dst = new cv.Mat();
        // Your OpenCV logic here
        cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
        return dst; // Return result for the next step
    }
}
```

### Current Default Pipeline (Captcha Processing)

The default configuration in `js/steps/defaultSteps.js` includes a sequence for cleaning noisy text:

1. **HSV Conversion**: Better color segmentation.
2. **Channel Selection**: Extracting the Saturation channel.
3. **Median Blur**: Removing noise.
4. **Otsu Thresholding**: Optimal binarization.
5. **Blob Removal**: Filtering small noise particles.
6. **Morphological Closing**: Joining broken segments.
7. **Bitwise Not**: Inverting for standard output.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
