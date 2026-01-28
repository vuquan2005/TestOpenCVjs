
export class UIManager {
    constructor() {
        this.pipelineContainer = document.getElementById('pipeline-container');
        this.masterContainer = document.getElementById('master-scrollbar-container');
        this.masterSpacer = document.getElementById('master-scrollbar-spacer');
        this.resultGrid = document.getElementById('resultGrid');
        this.modal = document.getElementById('resultModal');
        this.isSyncingLeft = false;

        this.initScrollSync();
        this.initModalEvents();
    }

    clear() {
        this.pipelineContainer.innerHTML = '';
        this.updateMasterScrollbar();
    }

    initScrollSync() {
        if (this.masterContainer) {
            this.masterContainer.addEventListener('scroll', () => {
                if (this.isSyncingLeft) return;
                this.isSyncingLeft = true;
                const currentLeft = this.masterContainer.scrollLeft;
                const allTracks = document.querySelectorAll('.images-track');
                allTracks.forEach(t => t.scrollLeft = currentLeft);
                window.requestAnimationFrame(() => this.isSyncingLeft = false);
            });
        }
    }

    createStepRow(titleText) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'step-row';

        const title = document.createElement('div');
        title.className = 'step-title';
        title.innerText = titleText;
        rowDiv.appendChild(title);

        const trackDiv = document.createElement('div');
        trackDiv.className = 'images-track';

        // Scroll Sync Logic for Track
        trackDiv.addEventListener('scroll', () => {
            if (this.isSyncingLeft) return;
            this.isSyncingLeft = true;
            const currentLeft = trackDiv.scrollLeft;

            const allTracks = document.querySelectorAll('.images-track');
            allTracks.forEach(t => {
                if (t !== trackDiv) t.scrollLeft = currentLeft;
            });

            if (this.masterContainer) {
                this.masterContainer.scrollLeft = currentLeft;
            }

            window.requestAnimationFrame(() => this.isSyncingLeft = false);
        });

        // Drag Scrolling
        this.initDragScroll(trackDiv);

        rowDiv.appendChild(trackDiv);
        this.pipelineContainer.appendChild(rowDiv);
        return trackDiv;
    }

    initDragScroll(trackDiv) {
        let isDown = false;
        let startX;
        let scrollLeft;

        trackDiv.addEventListener('mousedown', (e) => {
            isDown = true;
            trackDiv.style.cursor = 'grabbing';
            startX = e.pageX - trackDiv.offsetLeft;
            scrollLeft = trackDiv.scrollLeft;
        });

        trackDiv.addEventListener('mouseleave', () => {
            isDown = false;
            trackDiv.style.cursor = 'grab';
        });

        trackDiv.addEventListener('mouseup', () => {
            isDown = false;
            trackDiv.style.cursor = 'grab';
        });

        trackDiv.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - trackDiv.offsetLeft;
            const walk = (x - startX) * 2;
            trackDiv.scrollLeft = scrollLeft - walk;
        });

        trackDiv.style.cursor = 'grab';
    }

    renderOriginals(loadedItems) {
        const track = this.createStepRow("Original Images");
        loadedItems.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-item';

            const imgClone = item.img.cloneNode(true);
            wrapper.appendChild(imgClone);

            const label = document.createElement('div');
            label.className = 'image-label';
            label.innerText = item.name;
            wrapper.appendChild(label);

            track.appendChild(wrapper);
        });
        this.updateMasterScrollbar();
    }

    renderStep(stepName, mats, fileNames) {
        const track = this.createStepRow(stepName);

        mats.forEach((mat, i) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-item';

            const canvas = document.createElement('canvas');
            const canvasId = `cv-${stepName.replace(/\s/g, '')}-${i}-${Date.now()}`;
            canvas.id = canvasId;
            wrapper.appendChild(canvas);

            const label = document.createElement('div');
            label.className = 'image-label';
            label.innerText = fileNames[i];
            wrapper.appendChild(label);

            track.appendChild(wrapper);

            // Draw
            cv.imshow(canvasId, mat);
        });
        this.updateMasterScrollbar();
    }

    updateMasterScrollbar() {
        if (!this.masterSpacer || !this.masterContainer) return;
        let maxScrollWidth = 0;
        const allTracks = document.querySelectorAll('.images-track');
        allTracks.forEach(t => {
            if (t.scrollWidth > maxScrollWidth) maxScrollWidth = t.scrollWidth;
        });
        if (maxScrollWidth > 0) {
            this.masterSpacer.style.width = maxScrollWidth + 'px';
        }
    }

    initModalEvents() {
        const closeBtn = document.querySelector(".close-modal");
        if (closeBtn) {
            closeBtn.onclick = () => this.modal.style.display = "none";
        }
        window.onclick = (event) => {
            if (event.target == this.modal) this.modal.style.display = "none";
        }
    }

    showFinalResult(mats, fileNames) {
        if (!mats || mats.length === 0) {
            alert("No results to display!");
            return;
        }
        this.resultGrid.innerHTML = '';

        mats.forEach((mat, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'image-item';

            const canvas = document.createElement('canvas');
            const canvasId = `modal-cv-${index}-${Date.now()}`;
            canvas.id = canvasId;
            wrapper.appendChild(canvas);

            const label = document.createElement('div');
            label.className = 'image-label';
            label.innerText = fileNames[index] || `Image ${index + 1}`;
            wrapper.appendChild(label);

            this.resultGrid.appendChild(wrapper);
            cv.imshow(canvasId, mat);
        });

        this.modal.style.display = "block";
    }
}
