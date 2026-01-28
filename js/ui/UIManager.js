/**
 * Manages the main application UI, including rendering the pipeline steps,
 * handling scroll synchronization, and displaying results.
 */
import { ModalManager } from "./ModalManager.js";

export class UIManager {
    constructor() {
        this.pipelineContainer = document.getElementById("pipeline-container");
        this.masterContainer = document.getElementById("master-scrollbar-container");
        this.masterSpacer = document.getElementById("master-scrollbar-spacer");
        this.resultGrid = document.getElementById("resultGrid");
        this.modal = document.getElementById("resultModal");
        this.isSyncingLeft = false;

        this.initScrollSync();
        this.initModalEvents();
    }

    clear() {
        this.pipelineContainer.innerHTML = "";
        this.updateMasterScrollbar();
    }

    /**
     * Initializes the horizontal scroll synchronization between the master scrollbar and all image tracks.
     */
    initScrollSync() {
        if (this.masterContainer) {
            this.masterContainer.addEventListener("scroll", () => {
                if (this.isSyncingLeft) return;
                this.isSyncingLeft = true;
                const currentLeft = this.masterContainer.scrollLeft;
                const allTracks = document.querySelectorAll(".images-track");
                allTracks.forEach((t) => (t.scrollLeft = currentLeft));
                window.requestAnimationFrame(() => (this.isSyncingLeft = false));
            });
        }
    }

    /**
     * Creates a new visual row for a step or the original images.
     * @param {Object|string} stepOrTitle - Step object or string title.
     * @param {Object|null} callbacks - Action callbacks (edit, move, delete).
     * @param {Error|null} error - Error object if the step failed.
     * @returns {HTMLElement} The scrollable track element.
     */
    createStepRow(stepOrTitle, callbacks = null, error = null) {
        let titleText = typeof stepOrTitle === "string" ? stepOrTitle : stepOrTitle.name;

        const rowDiv = document.createElement("div");
        rowDiv.className = "step-row";

        const title = document.createElement("div");
        title.className = `step-title ${error ? "step-error" : ""}`;

        if (callbacks && typeof stepOrTitle === "object") {
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "step-actions";
            actionsDiv.style.marginRight = "10px";

            const btnEdit = this.createActionButton("✏️", "Edit", callbacks.onEdit);
            actionsDiv.appendChild(btnEdit);

            const btnUp = this.createActionButton("⬆️", "Move Up", callbacks.onMoveUp);
            if (!callbacks.canMoveUp) btnUp.disabled = true;
            actionsDiv.appendChild(btnUp);

            const btnDown = this.createActionButton("⬇️", "Move Down", callbacks.onMoveDown);
            if (!callbacks.canMoveDown) btnDown.disabled = true;
            actionsDiv.appendChild(btnDown);

            const btnDel = this.createActionButton("🗑️", "Delete", callbacks.onDelete);
            actionsDiv.appendChild(btnDel);

            if (error) {
                const btnError = this.createActionButton(
                    "⚠️",
                    `Error: ${error.toString()}\nClick to edit`,
                    callbacks.onEdit,
                );
                actionsDiv.appendChild(btnError);
            }

            title.appendChild(actionsDiv);
        }

        const textSpan = document.createElement("span");
        textSpan.innerText = titleText;
        title.appendChild(textSpan);

        rowDiv.appendChild(title);

        const trackDiv = document.createElement("div");
        trackDiv.className = "images-track";

        trackDiv.addEventListener("scroll", () => {
            if (this.isSyncingLeft) return;
            this.isSyncingLeft = true;
            const currentLeft = trackDiv.scrollLeft;

            const allTracks = document.querySelectorAll(".images-track");
            allTracks.forEach((t) => {
                if (t !== trackDiv) t.scrollLeft = currentLeft;
            });

            if (this.masterContainer) {
                this.masterContainer.scrollLeft = currentLeft;
            }

            window.requestAnimationFrame(() => (this.isSyncingLeft = false));
        });

        this.initDragScroll(trackDiv);

        rowDiv.appendChild(trackDiv);
        this.pipelineContainer.appendChild(rowDiv);
        return trackDiv;
    }

    createActionButton(icon, title, onClick) {
        const btn = document.createElement("button");
        btn.innerText = icon;
        btn.title = title;
        btn.onclick = (e) => {
            e.stopPropagation();
            if (onClick) onClick();
        };
        return btn;
    }

    /**
     * Enables "drag to scroll" functionality for a container.
     * @param {HTMLElement} trackDiv
     */
    initDragScroll(trackDiv) {
        let isDown = false;
        let startX;
        let scrollLeft;

        trackDiv.addEventListener("mousedown", (e) => {
            isDown = true;
            trackDiv.style.cursor = "grabbing";
            startX = e.pageX - trackDiv.offsetLeft;
            scrollLeft = trackDiv.scrollLeft;
        });

        trackDiv.addEventListener("mouseleave", () => {
            isDown = false;
            trackDiv.style.cursor = "grab";
        });

        trackDiv.addEventListener("mouseup", () => {
            isDown = false;
            trackDiv.style.cursor = "grab";
        });

        trackDiv.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - trackDiv.offsetLeft;
            const walk = (x - startX) * 2;
            trackDiv.scrollLeft = scrollLeft - walk;
        });

        trackDiv.style.cursor = "grab";
    }

    /**
     * Renders the initial row of original images.
     * @param {Array} loadedItems - Array of {img, name} objects.
     */
    renderOriginals(loadedItems) {
        const track = this.createStepRow("Original Images");
        loadedItems.forEach((item) => {
            const wrapper = document.createElement("div");
            wrapper.className = "image-item";

            const imgClone = item.img.cloneNode(true);
            wrapper.appendChild(imgClone);

            const label = document.createElement("div");
            label.className = "image-label";
            label.innerText = item.name;
            wrapper.appendChild(label);

            track.appendChild(wrapper);
        });
        this.updateMasterScrollbar();
    }

    /**
     * Renders a processed step with its output images.
     * @param {Object} step - The step object.
     * @param {Array<cv.Mat>} mats - Array of processed mats.
     * @param {string[]} fileNames - List of file names.
     * @param {number} stepIndex - Index of the current step.
     * @param {number} totalSteps - Total number of steps.
     * @param {Object} callbacks - callbacks for actions.
     * @param {Error|null} error - Error if occurred.
     */
    renderStep(step, mats, fileNames, stepIndex, totalSteps, callbacks, error = null) {
        const actionCallbacks =
            callbacks ?
                {
                    onEdit: () => callbacks.onEdit(step.id),
                    onMoveUp: () => callbacks.onMove(stepIndex, -1),
                    onMoveDown: () => callbacks.onMove(stepIndex, 1),
                    onDelete: () => callbacks.onDelete(step.id),
                    canMoveUp: stepIndex > 0,
                    canMoveDown: stepIndex < totalSteps - 1,
                }
            :   null;

        const track = this.createStepRow(step, actionCallbacks, error);

        mats.forEach((mat, i) => {
            const wrapper = document.createElement("div");
            wrapper.className = "image-item";

            const canvas = document.createElement("canvas");
            const canvasId = `cv-${step.name.replace(/\s/g, "")}-${i}-${Date.now()}`;
            canvas.id = canvasId;
            wrapper.appendChild(canvas);

            const label = document.createElement("div");
            label.className = "image-label";
            label.innerText = fileNames[i];
            wrapper.appendChild(label);

            track.appendChild(wrapper);

            cv.imshow(canvasId, mat);
        });
        this.updateMasterScrollbar();
    }

    /**
     * Updates the fake bottom scrollbar to match the widest content in the pipeline.
     */
    updateMasterScrollbar() {
        if (!this.masterSpacer || !this.masterContainer) return;
        let maxScrollWidth = 0;
        const allTracks = document.querySelectorAll(".images-track");
        allTracks.forEach((t) => {
            if (t.scrollWidth > maxScrollWidth) maxScrollWidth = t.scrollWidth;
        });
        if (maxScrollWidth > 0) {
            this.masterSpacer.style.width = maxScrollWidth + "px";
        }
    }

    initModalEvents() {
        const closeBtn = this.modal.querySelector(".close-modal");
        if (closeBtn) {
            closeBtn.onclick = () => {
                ModalManager.close(this.modal);
            };
        }
        window.addEventListener("click", (event) => {
            if (event.target == this.modal) {
                ModalManager.close(this.modal);
            }
        });
    }

    /**
     * Displays the final results in a modal grid.
     * @param {Array<cv.Mat>} mats
     * @param {string[]} fileNames
     */
    showFinalResult(mats, fileNames) {
        if (!mats || mats.length === 0) {
            alert("No results to display!");
            return;
        }
        this.resultGrid.innerHTML = "";

        mats.forEach((mat, index) => {
            const wrapper = document.createElement("div");
            wrapper.className = "image-item";

            const canvas = document.createElement("canvas");
            const canvasId = `modal-cv-${index}-${Date.now()}`;
            canvas.id = canvasId;
            wrapper.appendChild(canvas);

            const label = document.createElement("div");
            label.className = "image-label";
            label.innerText = fileNames[index] || `Image ${index + 1}`;
            wrapper.appendChild(label);

            this.resultGrid.appendChild(wrapper);
            cv.imshow(canvasId, mat);
        });

        ModalManager.open(this.modal);
    }
}
