import { ModalManager } from "./ModalManager.js";

export class SettingsUI {
    constructor(stepManager, onImportSuccess) {
        this.stepManager = stepManager;
        this.onImportSuccess = onImportSuccess;
        this.modal = document.getElementById("settingsModal");
        this.btnClose = this.modal ? this.modal.querySelector(".close-modal") : null;
        this.btnResetProject = document.getElementById("btnResetProject");
        this.itemSizeSlider = document.getElementById("itemSizeSlider");
        this.itemSizeValue = document.getElementById("itemSizeValue");
        
        this.btnCopySteps = document.getElementById("btnCopySteps");
        this.btnImportSteps = document.getElementById("btnImportSteps");
        this.stepsArea = document.getElementById("stepsArea");

        this.initSettings();
        this.initEvents();
    }

    initSettings() {
        // Load saved size or default
        const savedSize = localStorage.getItem("itemHeight");
        if (savedSize) {
            document.documentElement.style.setProperty("--item-height", savedSize + "px");
            if (this.itemSizeSlider) this.itemSizeSlider.value = savedSize;
            if (this.itemSizeValue) this.itemSizeValue.innerText = savedSize + "px";
        } else if (this.itemSizeSlider) {
             document.documentElement.style.setProperty("--item-height", this.itemSizeSlider.value + "px");
        }
    }

    initEvents() {
        if (this.btnClose) {
            this.btnClose.onclick = () => {
                ModalManager.close(this.modal);
            };
        }

        window.addEventListener("click", (event) => {
            if (event.target === this.modal) {
                ModalManager.close(this.modal);
            }
        });

        if (this.itemSizeSlider && this.itemSizeValue) {
            this.itemSizeSlider.addEventListener("input", (e) => {
                const val = e.target.value;
                document.documentElement.style.setProperty("--item-height", val + "px");
                this.itemSizeValue.innerText = val + "px";
                localStorage.setItem("itemHeight", val);
            });
        }

        if (this.btnResetProject) {
            this.btnResetProject.onclick = () => {
                if (
                    confirm(
                        "Are you sure you want to reset to default steps? All custom changes will be lost.",
                    )
                ) {
                    localStorage.removeItem(this.stepManager.STORAGE_KEY);
                    location.reload();
                }
            };
        }

        if (this.btnCopySteps) {
            this.btnCopySteps.onclick = () => {
                const text = this.getFormattedSteps();
                
                if (this.stepsArea) {
                    this.stepsArea.value = text;
                }

                navigator.clipboard.writeText(text).then(() => {
                    const originalText = this.btnCopySteps.innerText; // Use innerText to preserve icon if any, but simplified here
                    // Actually innerHTML is safer if we have icons
                    const originalHTML = this.btnCopySteps.innerHTML;
                    this.btnCopySteps.innerHTML = "✅ Copied!";
                    setTimeout(() => {
                        this.btnCopySteps.innerHTML = originalHTML;
                    }, 2000);
                }).catch(err => {
                    console.error("Failed to copy:", err);
                    alert("Failed to copy to clipboard");
                });
            };
        }

        if (this.btnImportSteps) {
            this.btnImportSteps.onclick = () => {
                const inputText = this.stepsArea ? this.stepsArea.value.trim() : "";
                if (!inputText) {
                    alert("Please paste steps in the textarea first.");
                    return;
                }

                let importedSteps = null;

                // Try to detect format and parse
                if (inputText.includes("/* STEP_START:") || inputText.includes("/* STEP[")) {
                    // Parse JS format with markers
                    importedSteps = this.parseStepsFromText(inputText);
                } else if (inputText.startsWith("[")) {
                    // Try JSON format
                    try {
                        importedSteps = JSON.parse(inputText);
                    } catch (e) {
                        alert("Invalid JSON format: " + e.message);
                        return;
                    }
                } else {
                    alert("Unknown format. Use the exported JS format or JSON array.");
                    return;
                }

                if (!importedSteps || importedSteps.length === 0) {
                    alert("No valid steps found in the input.");
                    return;
                }

                // Validate each step has required fields
                for (const step of importedSteps) {
                    if (!step.name || !step.code) {
                        alert("Invalid step format: each step must have 'name' and 'code' fields.");
                        return;
                    }
                }

                if (!confirm(`Import ${importedSteps.length} steps? This will replace all current steps.`)) {
                    return;
                }

                // Import the steps
                this.stepManager.importSteps(importedSteps);
                
                // Update the area with new steps
                if (this.stepsArea) {
                    this.stepsArea.value = this.getFormattedSteps();
                }

                const originalHTML = this.btnImportSteps.innerHTML;
                this.btnImportSteps.innerHTML = "✅ Imported!";
                setTimeout(() => {
                    this.btnImportSteps.innerHTML = originalHTML;
                }, 2000);

                if (this.onImportSuccess) {
                    this.onImportSuccess();
                }
            };
        }
    }

    /**
     * Formats steps for export using JS-based format with markers.
     * Format:
     * /* STEP[0]: Step Name *\/
     * code here...
     * /* STEP_END *\/
     */
    getFormattedSteps() {
        const steps = this.stepManager.getSteps();
        return steps.map((s, index) => 
            `/* STEP[${index + 1}]: ${s.name} */\n${s.code}\n/* STEP_END */`
        ).join("\n\n");
    }

    /**
     * Parses steps from the JS-based format with STEP[n]/STEP_END markers.
     * @param {string} text - The text to parse.
     * @returns {Array} Array of step objects with name and code.
     */
    parseStepsFromText(text) {
        const steps = [];
        // Match both old format (STEP_START) and new format (STEP[n])
        const regex = /\/\* (?:STEP_START|STEP\[\d+\]):\s*(.+?)\s*\*\/([\s\S]*?)\/\* STEP_END \*\//g;
        
        let match;
        while ((match = regex.exec(text)) !== null) {
            const name = match[1].trim();
            const code = match[2].trim();
            if (name && code) {
                steps.push({ name, code, enabled: true });
            }
        }
        
        return steps;
    }

    open() {
        ModalManager.open(this.modal);
        // Pre-fill the text area with current steps when opening
        if (this.stepsArea) {
            this.stepsArea.value = this.getFormattedSteps();
        }
    }
}
