/**
 * UI Manager for the Settings functionality.
 * Handles the step editor modal, Monaco editor integration, and saving changes to StepManager.
 */
export class SettingsUI {
    constructor(stepManager, onSave) {
        this.stepManager = stepManager;
        this.onSave = onSave;

        this.editorModal = document.getElementById("stepEditorModal");
        this.stepNameInput = document.getElementById("stepNameInput");
        this.stepIdInput = document.getElementById("stepIdInput");
        this.btnSaveStep = document.getElementById("btnSaveStep");
        this.btnCancelStep = document.getElementById("btnCancelStep");
        this.btnCloseEditor = this.editorModal.querySelector(".close-modal");

        this.monacoContainer = document.getElementById("monaco-container");
        this.editor = null;

        this.initEvents();
        // Monaco will be initialized on first open
        this.monacoLoaded = false;
    }

    /**
     * Lazily loads the Monaco Editor from CDN.
     */
    loadMonaco() {
        if (this.monacoLoaded) return;
        this.monacoLoaded = true;

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js";
        script.async = true;
        script.onload = () => {
            this.configureAndLoadMonaco();
        };
        document.body.appendChild(script);
    }

    /**
     * Configures the Monaco environment and initializes the editor instance.
     */
    configureAndLoadMonaco() {
        require.config({
            paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" },
        });

        // Proxy worker to avoid cross-origin issues with CDN
        window.MonacoEnvironment = {
            getWorkerUrl: function (workerId, label) {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                    self.MonacoEnvironment = {
                        baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/'
                    };
                    importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/base/worker/workerMain.js');`)}`;
            },
        };

        require(["vs/editor/editor.main"], () => {
            const isMobile = window.innerWidth <= 768;
            this.editor = monaco.editor.create(this.monacoContainer, {
                value: "",
                language: "javascript",
                theme: "vs-light",
                minimap: { enabled: false },
                automaticLayout: true,
                glyphMargin: false,
                lineNumbersMinChars: 2,
                lineDecorationsWidth: 7,
                folding: false,
                fontSize: isMobile ? 12 : 13,
                wordWrap: isMobile ? "on" : "off",
            });
        });
    }

    initEvents() {
        if (this.btnCloseEditor) {
            this.btnCloseEditor.onclick = () => {
                this.editorModal.style.display = "none";
                document.body.classList.remove("modal-open");
            };
        }

        if (this.btnSaveStep) {
            this.btnSaveStep.onclick = () => {
                this.saveStepFromEditor();
            };
        }

        if (this.btnCancelStep) {
            this.btnCancelStep.onclick = () => {
                this.editorModal.style.display = "none";
                document.body.classList.remove("modal-open");
            };
        }

        // Window click to close
        window.addEventListener("click", (event) => {
            // Note: Since we removed settingsModal, we only check editorModal
            if (event.target == this.editorModal) {
                this.editorModal.style.display = "none";
                document.body.classList.remove("modal-open");
            }
        });
    }

    // open() method removed as it opened the Settings List Modal.
    // Uses openEditor() directly.

    /**
     * Opens the Step Editor Modal.
     * @param {string|null} stepId - ID of the step to edit, or null to create a new step.
     */
    openEditor(stepId = null) {
        if (!this.monacoLoaded) {
            this.loadMonaco();
        }

        this.editorModal.style.display = "block";
        document.body.classList.add("modal-open");

        let codeValue = "";
        this.stepIdInput.value = stepId || "";

        if (stepId) {
            const step = this.stepManager.getSteps().find((s) => s.id === stepId);
            this.stepNameInput.value = step.name;
            codeValue = step.code;
            document.getElementById("editorTitle").innerText = "Edit Step";
        } else {
            this.stepNameInput.value = "New Step";
            codeValue = `
// cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

src.copyTo(dst);
`;
            document.getElementById("editorTitle").innerText = "Add Step";
        }

        if (this.editor) {
            this.editor.setValue(codeValue);
            // Layout needs to be called after container is visible
            setTimeout(() => this.editor.layout(), 100);
        } else {
            const checkEditor = setInterval(() => {
                if (this.editor) {
                    clearInterval(checkEditor);
                    this.editor.setValue(codeValue);
                    this.editor.layout();
                }
            }, 100);

            setTimeout(() => clearInterval(checkEditor), 10000);
        }
    }

    /**
     * Saves the step currently in the editor.
     * Validates input names and code syntax before saving.
     */
    saveStepFromEditor() {
        const id = this.stepIdInput.value;
        const name = this.stepNameInput.value;

        const code = this.editor ? this.editor.getValue() : "";

        if (!name || !code) {
            alert("Name and Code are required!");
            return;
        }

        try {
            const F = new Function("src", "cv", code);
        } catch (e) {
            alert("Syntax Error in code: " + e.message);
            return;
        }

        if (id) {
            this.stepManager.updateStep(id, name, code);
        } else {
            this.stepManager.addStep(name, code);
        }

        this.editorModal.style.display = "none";
        document.body.classList.remove("modal-open");

        if (this.onSave) this.onSave();
    }
}
