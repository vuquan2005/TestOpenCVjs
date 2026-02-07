import { PipelineManager } from "./core/PipelineManager.js";
import { UIManager } from "./ui/UIManager.js";
import { StepManager } from "./core/StepManager.js";
import { StepEditorUI } from "./ui/StepEditorUI.js";
import { SettingsUI } from "./ui/SettingsUI.js";
import { ModalManager } from "./ui/ModalManager.js";

ModalManager.init();

const DEFAULT_IMAGES = [
    "img/1.png",
    "img/2.png",
    "img/3.png",
    "img/4.png",
    "img/5.png",
    "img/6.png",
    "img/7.png",
    "img/8.png",
    "img/9.png",
    "img/10.png",
];

const pipeline = new PipelineManager();
const ui = new UIManager();

// Fetch default steps text and initialize
let stepManager;
let stepEditorUI;
let appSettingsUI;

async function initStepManager() {
    let defaultStepsText = "";
    try {
        const response = await fetch("js/steps/defaultSteps.txt");
        if (response.ok) {
            defaultStepsText = await response.text();
        }
    } catch (e) {
        console.warn("Could not load defaultSteps.txt:", e);
    }
    
    stepManager = new StepManager(defaultStepsText);
    
    stepEditorUI = new StepEditorUI(stepManager, () => {
        runPipeline();
    });
    
    appSettingsUI = new SettingsUI(stepManager, () => {
        runPipeline();
    });
}

// Initialize and continue setup
initStepManager();

const btnProcess = document.getElementById("btnProcess");
const fileInput = document.getElementById("fileInput");
const btnViewResult = document.getElementById("btnViewResult");
const statusIcon = document.getElementById("status");

// Reset Project logic moved to SettingsUI

/**
 * Main execution function.
 * 1. Checks OpenCV status.
 * 2. Clears UI.
 * 3. Loads images (from file or default).
 * 4. Iterates through steps, executing them and rendering results.
 */
async function runPipeline() {
    if (!stepManager) {
        console.warn("StepManager not ready yet");
        return;
    }
    
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
                stepEditorUI.openEditor(id);
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
            onMoveToIndex: async (toIndex) => {
                const allSteps = stepManager.getSteps();
                const fromIndex = allSteps.findIndex((s) => s.id === step.id);
                if (fromIndex !== -1) {
                    const success = stepManager.moveStepToIndex(fromIndex, toIndex);
                    if (success) {
                        await runPipeline();
                    }
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

// About Modal Logic
const btnAbout = document.getElementById("btnAbout");
const aboutModal = document.getElementById("aboutModal");
const closeAbout = aboutModal ? aboutModal.querySelector(".close-modal") : null;

if (btnAbout && aboutModal) {
    btnAbout.addEventListener("click", () => {
        ModalManager.open(aboutModal);
    });

    if (closeAbout) {
        closeAbout.addEventListener("click", () => {
            ModalManager.close(aboutModal);
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === aboutModal) {
            ModalManager.close(aboutModal);
        }
    });
}

// Settings Modal Logic
const btnSettings = document.getElementById("btnSettings");
if (btnSettings) {
    btnSettings.addEventListener("click", () => {
        if (appSettingsUI) appSettingsUI.open();
    });
}

const btnAddNewStepMain = document.getElementById("btnAddNewStepMain");
if (btnAddNewStepMain) {
    btnAddNewStepMain.addEventListener("click", () => {
        if (stepEditorUI) stepEditorUI.openEditor();
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
