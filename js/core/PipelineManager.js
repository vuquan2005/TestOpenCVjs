/**
 * Manages the image processing pipeline state.
 * Handles loading images, executing processing steps, and managing memory for OpenCV Mats.
 */
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
            this.currentMats.forEach((mat) => {
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
        const promises = Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                const name = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                img.onload = () => resolve({ img, name });
                img.onerror = reject;
            });
        });

        const loaded = await Promise.all(promises);

        loaded.forEach((item) => {
            const mat = cv.imread(item.img);
            this.currentMats.push(mat);
            this.fileNames.push(item.name);
        });

        return loaded;
    }

    /**
     * Loads images from URLs
     * @param {string[]} urls
     */
    async loadImagesFromUrls(urls) {
        this.reset();
        const promises = urls.map((url) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "Anonymous"; // Important for canvas
                img.src = url;
                let name = url.split("/").pop();
                name = name.substring(0, name.lastIndexOf(".")) || name;
                img.onload = () => resolve({ img, name });
                img.onerror = reject;
            });
        });

        const loaded = await Promise.all(promises);

        loaded.forEach((item) => {
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
        let error = null;

        for (let i = 0; i < this.currentMats.length; i++) {
            const src = this.currentMats[i];
            try {
                const dst = callback(src);
                nextMats.push(dst);
            } catch (e) {
                if (!error) error = e;
                nextMats.push(src.clone());
            }
        }

        this.currentMats.forEach((mat) => mat.delete());

        this.currentMats = nextMats;

        return {
            mats: this.currentMats,
            error: error,
        };
    }

    /**
     * Returns the array of currently held OpenCV Mats.
     * @returns {Array<cv.Mat>}
     */
    getCurrentMats() {
        return this.currentMats;
    }

    /**
     * Returns the list of filenames corresponding to the current mats.
     * @returns {string[]}
     */
    getFileNames() {
        return this.fileNames;
    }
}
