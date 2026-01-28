export class SettingsUI {
    constructor(stepManager, onSave) {
        this.stepManager = stepManager;
        this.onSave = onSave;

        this.editorModal = document.getElementById("stepEditorModal");
        this.stepNameInput = document.getElementById("stepNameInput");
        this.stepIdInput = document.getElementById("stepIdInput");
        this.btnSaveStep = document.getElementById("btnSaveStep");
        this.btnCloseEditor = document.querySelector(".close-editor");

        this.monacoContainer = document.getElementById("monaco-container");
        this.editor = null;

        this.initEvents();
        // Monaco will be initialized on first open
        this.monacoLoaded = false;
    }

    loadMonaco() {
        if (this.monacoLoaded) return;
        this.monacoLoaded = true; // Prevent double loading

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js";
        script.async = true;
        script.onload = () => {
            this.configureAndLoadMonaco();
        };
        document.body.appendChild(script);
    }

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
            this.editor = monaco.editor.create(this.monacoContainer, {
                value: "",
                language: "javascript",
                theme: "vs-light",
                minimap: { enabled: false },
                automaticLayout: true,
            });
        });
    }

    initEvents() {
        if (this.btnCloseEditor) {
            this.btnCloseEditor.onclick = () => (this.editorModal.style.display = "none");
        }

        if (this.btnSaveStep) {
            this.btnSaveStep.onclick = () => {
                this.saveStepFromEditor();
            };
        }

        // Window click to close
        window.onclick = (event) => {
            // Note: Since we removed settingsModal, we only check editorModal
            if (event.target == this.editorModal) this.editorModal.style.display = "none";
        };
    }

    // open() method removed as it opened the Settings List Modal.
    // Uses openEditor() directly.

    openEditor(stepId = null) {
        if (!this.monacoLoaded) {
            this.loadMonaco();
        }

        this.editorModal.style.display = "block";

        let codeValue = "";
        this.stepIdInput.value = stepId || "";

        if (stepId) {
            const step = this.stepManager.getSteps().find((s) => s.id === stepId);
            this.stepNameInput.value = step.name;
            codeValue = step.code;
            document.getElementById("editorTitle").innerText = "Edit Step";
        } else {
            this.stepNameInput.value = "New Step";
            codeValue = `// --- VÍ DỤ: CHUYỂN ẢNH XÁM (GRAYSCALE) ---
// cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

src.copyTo(dst);
`;
            document.getElementById("editorTitle").innerText = "Add Step";
        }

        // Set value to Monaco
        if (this.editor) {
            this.editor.setValue(codeValue);
            // Layout needs to be called after container is visible
            setTimeout(() => this.editor.layout(), 100);
        } else {
            // Wait for editor to be ready
            const checkEditor = setInterval(() => {
                if (this.editor) {
                    clearInterval(checkEditor);
                    this.editor.setValue(codeValue);
                    this.editor.layout();
                }
            }, 100);

            // Timeout after 10 seconds to stop checking
            setTimeout(() => clearInterval(checkEditor), 10000);
        }
    }

    saveStepFromEditor() {
        const id = this.stepIdInput.value;
        const name = this.stepNameInput.value;

        // Get value from Monaco
        const code = this.editor ? this.editor.getValue() : "";

        if (!name || !code) {
            alert("Name and Code are required!");
            return;
        }

        try {
            // Validate syntax roughly
            const F = new Function("src", "cv", code); // Just test parse
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
        // removed this.renderList();

        // Trigger auto-save/reload if callback exists
        if (this.onSave) this.onSave();
    }
}
