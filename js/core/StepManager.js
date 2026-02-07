/**
 * Manages the list of image processing steps.
 * Handles loading from localStorage, saving, and compiling user code into executable functions.
 */
export class StepManager {
    constructor(defaultStepsText = "") {
        this.STORAGE_KEY = "opencv_pipeline_steps";
        this.defaultStepsText = defaultStepsText;
        this.steps = this.loadSteps();
    }

    /**
     * Loads steps from localStorage or falls back to defaults.
     * @returns {Array} List of step objects.
     */
    loadSteps() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse stored steps", e);
                return this.parseStepsFromText(this.defaultStepsText);
            }
        }
        return this.parseStepsFromText(this.defaultStepsText);
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
                steps.push({
                    id: crypto.randomUUID(),
                    name,
                    code,
                    enabled: true
                });
            }
        }
        
        return steps;
    }

    /**
     * Saves the current steps to localStorage.
     */
    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.steps));
    }

    /**
     * Imports steps from an array of step objects.
     * Each step should have 'name' and 'code' fields.
     * @param {Array} importedSteps - Array of step objects to import.
     */
    importSteps(importedSteps) {
        this.steps = importedSteps.map(step => ({
            id: step.id || crypto.randomUUID(),
            name: step.name,
            code: step.code,
            enabled: step.enabled !== undefined ? step.enabled : true,
        }));
        this.save();
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
     * Available variables in user code:
     *   - src: result from previous step
     *   - steps: array of all previous results (steps[0] = original image)
     *   - dst: output Mat (pre-initialized)
     * @returns {Array} List of steps with a callable `process(src, steps)` method.
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
                    const func = new Function("src", "steps", "cv", wrappedBody);
                    return {
                        id: s.id,
                        name: s.name,

                        process: (src, steps) => {
                            try {
                                return func(src, steps, cv);
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
                        process: (src, steps) => src.clone(),
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

    /**
     * Moves a step from one index to another.
     * @param {number} fromIndex - Current index of the step (0-based).
     * @param {number} toIndex - Target index (0-based).
     * @returns {boolean} True if move was successful.
     */
    moveStepToIndex(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.steps.length) return false;
        if (toIndex < 0 || toIndex >= this.steps.length) return false;
        if (fromIndex === toIndex) return false;

        const [step] = this.steps.splice(fromIndex, 1);
        this.steps.splice(toIndex, 0, step);
        this.save();
        return true;
    }
}
