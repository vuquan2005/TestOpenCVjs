/**
 * Central manager for modal dialogs.
 * Handles opening, closing, and history state for back-button support on mobile.
 */
export class ModalManager {
    static init() {
        window.addEventListener("popstate", (event) => {
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            if (openModals.length > 0) {
                openModals.forEach((modal) => {
                    this.close(modal, true);
                });
            }
        });
    }

    /**
     * Opens a modal and pushes a new state to history.
     * @param {HTMLElement} modal
     */
    static open(modal) {
        if (!modal) return;
        modal.style.display = "block";
        document.body.classList.add("modal-open");

        // Push state for mobile back button support
        history.pushState({ modalOpen: true, modalId: modal.id }, "");
    }

    /**
     * Closes a modal.
     * @param {HTMLElement} modal
     * @param {boolean} isPopState - Whether this call comes from a popstate event.
     */
    static close(modal, isPopState = false) {
        if (!modal) return;
        modal.style.display = "none";

        // Only remove modal-open class if no other modals are open
        const otherOpenModals = document.querySelectorAll('.modal[style*="display: block"]');
        if (otherOpenModals.length === 0) {
            document.body.classList.remove("modal-open");
        }

        // If closed manually (not via back button), remove the history entry
        if (!isPopState && history.state?.modalOpen) {
            history.back();
        }
    }
}
