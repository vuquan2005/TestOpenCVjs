/**
 * UI Manager for the Settings functionality.
 * Handles the step editor modal, Monaco editor integration, and saving changes to StepManager.
 */
import { ModalManager } from "./ModalManager.js";

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
        this.btnCommandPalette = document.getElementById("btnCommandPalette");
        this.btnCopy = document.getElementById("btnCopy");
        this.btnToggleReadOnly = document.getElementById("btnToggleReadOnly");
        this.btnToggleWordWrap = document.getElementById("btnToggleWordWrap");

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
            this.registerCompletions();

            const isMobile = window.innerWidth <= 768;
            this.editor = monaco.editor.create(this.monacoContainer, {
                value: "",
                language: "javascript",
                theme: "vs-light",
                minimap: { enabled: false },
                automaticLayout: true,
                glyphMargin: false,
                lineNumbersMinChars: 3,
                lineDecorationsWidth: 0,
                fontSize: isMobile ? 12 : 13,
                wordWrap: isMobile ? "on" : "off",
                parameterHints: {
                    enabled: true,
                },
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: true,
                accessibilitySupport: "on",
            });

            this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                this.saveStepFromEditor();
            });

            this.updateWordWrapButton(isMobile);
        });
    }

    /**
     * Registers TypeScript definitions for OpenCV.js in Monaco Editor.
     * Loads the opencv.d.ts file and adds it as extra lib for autocomplete.
     */
    async registerCompletions() {
        try {
            // Fetch the OpenCV.js type definitions
            const response = await fetch("types/opencv.d.ts");
            if (!response.ok) {
                console.warn("Could not load opencv.d.ts for autocomplete");
                return;
            }

            const dtsContent = await response.text();

            // Configure JavaScript/TypeScript defaults for Monaco
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: true,
                noSyntaxValidation: false,
            });

            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.ES2020,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                typeRoots: ["types"],
            });

            // Add the OpenCV.js type definitions as extra lib
            // The second argument is just an identifier, not a real file path
            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                dtsContent,
                "ts:opencv.d.ts",
            );

            console.log("OpenCV.js type definitions loaded successfully");
        } catch (error) {
            console.warn("Failed to load OpenCV.js type definitions:", error);
        }
    }

    initEvents() {
        if (this.btnCloseEditor) {
            this.btnCloseEditor.onclick = () => {
                ModalManager.close(this.editorModal);
            };
        }

        if (this.btnSaveStep) {
            this.btnSaveStep.onclick = () => {
                this.saveStepFromEditor();
            };
        }

        if (this.btnCancelStep) {
            this.btnCancelStep.onclick = () => {
                ModalManager.close(this.editorModal);
            };
        }

        if (this.btnCommandPalette) {
            this.btnCommandPalette.onmousedown = (e) => {
                e.preventDefault();
                if (this.editor) {
                    this.editor.focus();
                    this.editor.getAction("editor.action.quickCommand").run();
                }
            };
        }

        if (this.btnCopy) {
            this.btnCopy.onclick = () => {
                if (this.editor) {
                    const code = this.editor.getValue();
                    navigator.clipboard.writeText(code).then(() => {
                        const originalText = this.btnCopy.innerHTML;
                        this.btnCopy.innerHTML = "✅ Copied!";
                        setTimeout(() => {
                            this.btnCopy.innerHTML = originalText;
                        }, 2000);
                    }).catch(err => {
                        console.error("Failed to copy:", err);
                    });
                }
            };
        }

        if (this.btnToggleReadOnly) {
            this.btnToggleReadOnly.onclick = () => {
                if (this.editor) {
                    const isReadOnly = this.editor.getOption(monaco.editor.EditorOption.readOnly);
                    const newReadOnlyState = !isReadOnly;

                    this.editor.updateOptions({
                        readOnly: newReadOnlyState,
                        domReadOnly: newReadOnlyState, // Prevent focus/keyboard
                        renderLineHighlight: newReadOnlyState ? 'none' : 'line' // Hide/show visual focus
                    });

                    this.updateReadOnlyButton(newReadOnlyState);
                }
            };
        }

        if (this.btnToggleWordWrap) {
            this.btnToggleWordWrap.onclick = () => {
                if (this.editor) {
                    const currentWrap = this.editor.getOption(monaco.editor.EditorOption.wordWrap);
                    const newWrap = currentWrap === "on" ? "off" : "on";
                    this.editor.updateOptions({ wordWrap: newWrap });
                    this.updateWordWrapButton(newWrap === "on");
                }
            };
        }

        // Window click to close
        window.addEventListener("click", (event) => {
            // Note: Since we removed settingsModal, we only check editorModal
            if (event.target == this.editorModal) {
                ModalManager.close(this.editorModal);
            }
        });

        // Ctrl+S listener for the modal (outside editor focus)
        document.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                if (this.editorModal && this.editorModal.style.display === "block") {
                    event.preventDefault();
                    this.saveStepFromEditor();
                }
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

        ModalManager.open(this.editorModal);

        let codeValue = "";
        this.stepIdInput.value = stepId || "";

        if (stepId) {
            const step = this.stepManager.getSteps().find((s) => s.id === stepId);
            this.stepNameInput.value = step.name;
            codeValue = step.code;
            document.getElementById("editorTitle").innerText = "Edit Step";
        } else {
            this.stepNameInput.value = "New Step";
            codeValue = `// src is input Mat, steps[] contains previous results, return dst
// cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

src.copyTo(dst);
`;
            document.getElementById("editorTitle").innerText = "Add Step";
        }

        if (this.editor) {
            this.editor.setValue(codeValue);
            this.editor.updateOptions({ 
                readOnly: false,
                domReadOnly: false,
                renderLineHighlight: 'line' 
            });
            this.updateReadOnlyButton(false);
            // Layout needs to be called after container is visible
            setTimeout(() => this.editor.layout(), 100);
        } else {
            const checkEditor = setInterval(() => {
                if (this.editor) {
                    clearInterval(checkEditor);
                    this.editor.setValue(codeValue);
                    this.editor.updateOptions({ 
                        readOnly: false,
                        domReadOnly: false,
                        renderLineHighlight: 'line'
                    });
                    this.updateReadOnlyButton(false);
                    this.editor.layout();
                }
            }, 100);

            setTimeout(() => clearInterval(checkEditor), 10000);
        }
    }

    updateReadOnlyButton(isReadOnly) {
        if (this.btnToggleReadOnly) {
            this.btnToggleReadOnly.innerHTML = isReadOnly ? "📝" : "👀";
            this.btnToggleReadOnly.title = isReadOnly ? "Click to Edit" : "Click to set Read-Only";
        }
    }

    updateWordWrapButton(isWrapped) {
        if (this.btnToggleWordWrap) {
            this.btnToggleWordWrap.innerHTML = isWrapped ? "↩️" : "➡️";
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

        ModalManager.close(this.editorModal);

        if (this.onSave) this.onSave();
    }
}
