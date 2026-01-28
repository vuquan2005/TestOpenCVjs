/**
 * Manages the list of image processing steps.
 * Handles loading from localStorage, saving, and compiling user code into executable functions.
 */
export class StepManager {
    constructor(defaultSteps = []) {
        this.STORAGE_KEY = "opencv_pipeline_steps";
        this.steps = this.loadSteps(defaultSteps);
    }

    /**
     * Loads steps from localStorage or falls back to defaults.
     * @param {Array} defaultSteps - List of default steps to use if storage is empty.
     * @returns {Array} List of step objects.
     */
    loadSteps(defaultSteps) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse stored steps", e);
                return this.initFromDefaults(defaultSteps);
            }
        }
        return this.initFromDefaults(defaultSteps);
    }

    /**
     * Initializes steps from the default list, converting function bodies to strings.
     * @param {Array} defaultSteps
     * @returns {Array} List of serializable step objects.
     */
    initFromDefaults(defaultSteps) {
        // Convert existing function-based steps to serializable format
        return defaultSteps.map((step) => {
            let code = step.process.toString();
            // Try to extract body between { and }
            const bodyStart = code.indexOf("{");
            const bodyEnd = code.lastIndexOf("}");
            if (bodyStart !== -1 && bodyEnd !== -1) {
                code = code.substring(bodyStart + 1, bodyEnd).trim();
            }
            return {
                id: crypto.randomUUID(),
                name: step.name,
                code: code,
                enabled: true,
            };
        });
    }

    /**
     * Saves the current steps to localStorage.
     */
    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.steps));
    }

    /**
     * Returns the raw list of steps (for UI editing).
     * @returns {Array}
     */
    getSteps() {
        return this.steps;
    }

    /**
     * Converts stored steps into executable functions.
     * Compiles the code string into a function that acts as a sandbox.
     * @returns {Array} List of steps with a callable `process(src)` method.
     */
    getExecutableSteps() {
        return this.steps
            .filter((s) => s.enabled)
            .map((s) => {
                const wrappedBody = `
                    "use strict";
                    let dst = new cv.Mat();
                    try {
                        ${s.code}
                        if (dst.empty()) {
                            dst.delete(); 
                            return src.clone();
                        }
                        return dst;
                    } catch (e) {
                        if (dst) dst.delete();
                        throw e;
                    }
                `;
                try {
                    const func = new Function("src", "cv", wrappedBody);
                    return {
                        id: s.id,
                        name: s.name,

                        process: (src) => {
                            try {
                                return func(src, cv);
                            } catch (runtimeError) {
                                console.error(`❌ Error running step [${s.name}]:`, runtimeError);
                                throw runtimeError;
                            }
                        },
                    };
                } catch (syntaxError) {
                    console.error(`❌ Syntax error in step [${s.name}]:`, syntaxError);
                    return {
                        name: `${s.name} (Syntax Error)`,
                        process: (src) => src.clone(),
                    };
                }
            });
    }

    /**
     * Adds a new step.
     * @param {string} name - Name of the step.
     * @param {string} code - Function body code.
     */
    addStep(name, code) {
        this.steps.push({
            id: crypto.randomUUID(),
            name: name,
            code: code,
            enabled: true,
        });
        this.save();
    }

    /**
     * Updates an existing step.
     * @param {string} id - UUID of the step.
     * @param {string} name - New name.
     * @param {string} code - New code.
     */
    updateStep(id, name, code) {
        const step = this.steps.find((s) => s.id === id);
        if (step) {
            step.name = name;
            step.code = code;
            this.save();
        }
    }

    /**
     * Deletes a step by ID.
     * @param {string} id
     */
    deleteStep(id) {
        this.steps = this.steps.filter((s) => s.id !== id);
        this.save();
    }

    /**
     * Moves a step up or down in the list.
     * @param {number} index - Current index of the step.
     * @param {number} direction - -1 for up, 1 for down.
     */
    moveStep(index, direction) {
        if (direction === -1 && index > 0) {
            [this.steps[index], this.steps[index - 1]] = [this.steps[index - 1], this.steps[index]];
        } else if (direction === 1 && index < this.steps.length - 1) {
            [this.steps[index], this.steps[index + 1]] = [this.steps[index + 1], this.steps[index]];
        }
        this.save();
    }
}
