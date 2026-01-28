
export class PipelineManager {
    constructor() {
        this.currentMats = [];
        this.fileNames = [];
    }

    /**
     * Resets the pipeline state, deleting all current mats to free memory.
     */
    reset() {
        if (this.currentMats) {
            this.currentMats.forEach(mat => {
                if (!mat.isDeleted()) mat.delete();
            });
        }
        this.currentMats = [];
        this.fileNames = [];
    }

    /**
     * Loads images from FileList
     * @param {FileList|File[]} files 
     */
    async loadImages(files) {
        this.reset();
        const promises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                const name = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                img.onload = () => resolve({ img, name });
                img.onerror = reject;
            });
        });

        const loaded = await Promise.all(promises);

        // Init initial mats
        loaded.forEach(item => {
            const mat = cv.imread(item.img);
            this.currentMats.push(mat);
            this.fileNames.push(item.name);
        });

        return loaded; // Return loaded objects for UI to render initial row
    }

    /**
     * Loads images from URLs
     * @param {string[]} urls 
     */
    async loadImagesFromUrls(urls) {
        this.reset();
        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous'; // Important for canvas
                img.src = url;
                let name = url.split('/').pop();
                name = name.substring(0, name.lastIndexOf('.')) || name;
                img.onload = () => resolve({ img, name });
                img.onerror = reject;
            });
        });

        const loaded = await Promise.all(promises);

        loaded.forEach(item => {
            const mat = cv.imread(item.img);
            this.currentMats.push(mat);
            this.fileNames.push(item.name);
        });

        return loaded;
    }

    /**
     * Executes a single processing step on all current images.
     * @param {string} stepName 
     * @param {Function} callback (srcMat) => dstMat
     * @returns {Array} List of processed mats
     */
    executeStep(callback) {
        const nextMats = [];
        for (let i = 0; i < this.currentMats.length; i++) {
            const src = this.currentMats[i];
            const dst = callback(src);
            nextMats.push(dst);
        }

        // Clean up old mats
        this.currentMats.forEach(mat => mat.delete());

        // Update state
        this.currentMats = nextMats;

        return this.currentMats;
    }

    getCurrentMats() {
        return this.currentMats;
    }

    getFileNames() {
        return this.fileNames;
    }
}
