import { PipelineManager } from "./core/PipelineManager.js";
import { UIManager } from "./ui/UIManager.js";
import { steps as defaultSteps } from "./steps/defaultSteps.js";
import { StepManager } from "./core/StepManager.js";
import { SettingsUI } from "./ui/SettingsUI.js";

const DEFAULT_IMAGES = [
    "img/1.jpg",
    "img/2.jpg",
    "img/3.jpg",
    "img/4.jpg",
    "img/5.jpg",
    "img/6.jpg",
];

const pipeline = new PipelineManager();
const ui = new UIManager();
const stepManager = new StepManager(defaultSteps);

const btnProcess = document.getElementById("btnProcess");
const fileInput = document.getElementById("fileInput");
const btnViewResult = document.getElementById("btnViewResult");
const statusIcon = document.getElementById("status");

const settingsUI = new SettingsUI(stepManager, () => {
    runPipeline();
});

const btnResetProject = document.getElementById("btnResetProject");
if (btnResetProject) {
    btnResetProject.addEventListener("click", () => {
        if (
            confirm(
                "Are you sure you want to reset to default steps? All custom changes will be lost.",
            )
        ) {
            localStorage.removeItem(stepManager.STORAGE_KEY);
            location.reload();
        }
    });
}

/**
 * Main execution function.
 * 1. Checks OpenCV status.
 * 2. Clears UI.
 * 3. Loads images (from file or default).
 * 4. Iterates through steps, executing them and rendering results.
 */
async function runPipeline() {
    if (typeof cv === "undefined" || !cv.getBuildInformation) {
        console.warn("OpenCV not ready yet");
        return;
    }

    btnProcess.disabled = true;

    ui.clear();

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

    ui.renderOriginals(loadedItems);

    const currentSteps = stepManager.getExecutableSteps();

    for (let i = 0; i < currentSteps.length; i++) {
        const step = currentSteps[i];

        // We defer UI updates to allow browser render (optional but good for UX)
        await new Promise((r) => requestAnimationFrame(r));

        const { mats, error } = pipeline.executeStep(step.process);

        const actions = {
            onEdit: (id) => {
                settingsUI.openEditor(id);
            },
            onMove: async (vizIndex, dir) => {
                const allSteps = stepManager.getSteps();
                const realIndex = allSteps.findIndex((s) => s.id === step.id);
                if (realIndex !== -1) {
                    stepManager.moveStep(realIndex, dir);
                    console.log("Moved step, rerunning pipeline...");
                    await runPipeline();
                }
            },
            onDelete: async (id) => {
                if (confirm(`Delete step "${step.name}"?`)) {
                    stepManager.deleteStep(id);
                    await runPipeline();
                }
            },
        };

        ui.renderStep(step, mats, pipeline.getFileNames(), i, currentSteps.length, actions, error);
    }

    btnProcess.disabled = false;
}

btnProcess.addEventListener("click", () => {
    runPipeline();
});

fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        btnProcess.click();
    }
});

btnViewResult.addEventListener("click", () => {
    ui.showFinalResult(pipeline.getCurrentMats(), pipeline.getFileNames());
});

const btnAddNewStepMain = document.getElementById("btnAddNewStepMain");
if (btnAddNewStepMain) {
    btnAddNewStepMain.addEventListener("click", () => {
        settingsUI.openEditor();
    });
}

function onOpenCVReady() {
    statusIcon.innerText = "🟢";
    statusIcon.style.color = "green";
    statusIcon.title = "OpenCV Ready";
    btnProcess.disabled = false;
    console.log("OpenCV Ready");

    setTimeout(() => {
        btnProcess.click();
    }, 500);
}

const checkOpenCv = setInterval(() => {
    if (typeof cv !== "undefined" && cv.getBuildInformation) {
        clearInterval(checkOpenCv);
        onOpenCVReady();
    }
}, 100);
