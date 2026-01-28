
import { PipelineManager } from './core/PipelineManager.js';
import { UIManager } from './ui/UIManager.js';
import { steps } from './steps/defaultSteps.js';

const DEFAULT_IMAGES = [
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg'
];

const pipeline = new PipelineManager();
const ui = new UIManager();

const btnProcess = document.getElementById('btnProcess');
const fileInput = document.getElementById('fileInput');
const btnViewResult = document.getElementById('btnViewResult');
const statusIcon = document.getElementById('status');

async function runPipeline() {
    // Check if OpenCV is ready
    if (typeof cv === 'undefined' || !cv.getBuildInformation) {
        console.warn("OpenCV not ready yet");
        return;
    }

    // Disable button while processing
    btnProcess.disabled = true;

    // Clear UI mainly for the pipeline part
    ui.clear();

    // Check input source and load images
    let loadedItems;

    if (fileInput.files.length > 0) {
        loadedItems = await pipeline.loadImages(fileInput.files);
    } else {
        loadedItems = await pipeline.loadImagesFromUrls(DEFAULT_IMAGES);
    }

    if (!pipeline.getCurrentMats() || pipeline.getCurrentMats().length === 0) {
        console.warn("No images loaded");
        btnProcess.disabled = false;
        return;
    }

    // Render Original Row
    ui.renderOriginals(loadedItems);

    // Run Steps
    for (const step of steps) {
        // We defer UI updates to allow browser render (optional but good for UX)
        await new Promise(r => requestAnimationFrame(r));

        const results = pipeline.executeStep(step.process);
        ui.renderStep(step.name, results, pipeline.getFileNames());
    }

    btnProcess.disabled = false;
}

// Event Listeners
btnProcess.addEventListener('click', () => {
    runPipeline();
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        btnProcess.click();
    }
});

btnViewResult.addEventListener('click', () => {
    ui.showFinalResult(pipeline.getCurrentMats(), pipeline.getFileNames());
});

// OpenCV Initialization Helper
function onOpenCVReady() {
    statusIcon.innerText = '🟢';
    statusIcon.style.color = 'green';
    btnProcess.disabled = false;
    console.log("OpenCV Ready");

    // Auto run
    setTimeout(() => {
        btnProcess.click();
    }, 500);
}

// Check OpenCV Status
const checkOpenCv = setInterval(() => {
    if (typeof cv !== 'undefined' && cv.getBuildInformation) {
        clearInterval(checkOpenCv);
        onOpenCVReady();
    }
}, 100);
