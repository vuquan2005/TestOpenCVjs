export class StepManager {
    constructor(defaultSteps = []) {
        this.STORAGE_KEY = "opencv_pipeline_steps";
        this.steps = this.loadSteps(defaultSteps);
    }

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

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.steps));
    }

    getSteps() {
        return this.steps;
    }

    getExecutableSteps() {
        return this.steps
            .filter((s) => s.enabled)
            .map((s) => {
                // 1. CHUẨN BỊ MÔI TRƯỜNG "SANDBOX"
                // Ép buộc code chạy trong try/catch và dùng dst có sẵn
                const wrappedBody = `
                    "use strict";
                    // Tự động tạo dst để người dùng không phải new
                    let dst = new cv.Mat(); 
                    
                    try {
                        // --- Code người dùng (được chèn vào đây) ---
                        ${s.code}
                        // -------------------------------------------

                        // Kiểm tra xem người dùng có gán dữ liệu vào dst không
                        if (dst.empty()) {
                            // Nếu họ quên xử lý, ít nhất trả về clone của src để không crash
                            dst.delete(); 
                            return src.clone();
                        }
                        return dst;

                    } catch (e) {
                        // Nếu lỗi, dọn dẹp bộ nhớ ngay lập tức
                        if (dst) dst.delete();
                        throw e; // Ném lỗi ra ngoài để hàm process hứng
                    }
                `;

                try {
                    // 2. TẠO HÀM MỘT LẦN (Compile)
                    const func = new Function("src", "cv", wrappedBody);

                    return {
                        id: s.id,
                        name: s.name,
                        // 3. THỰC THI AN TOÀN
                        process: (src) => {
                            try {
                                return func(src, cv);
                            } catch (runtimeError) {
                                console.error(`❌ Lỗi chạy bước [${s.name}]:`, runtimeError);
                                throw runtimeError;
                            }
                        },
                    };
                } catch (syntaxError) {
                    console.error(`❌ Lỗi cú pháp ở bước [${s.name}]:`, syntaxError);
                    return {
                        name: `${s.name} (Lỗi cú pháp)`,
                        process: (src) => src.clone(), // Bypass
                    };
                }
            });
    }

    addStep(name, code) {
        this.steps.push({
            id: crypto.randomUUID(),
            name: name,
            code: code,
            enabled: true,
        });
        this.save();
    }

    updateStep(id, name, code) {
        const step = this.steps.find((s) => s.id === id);
        if (step) {
            step.name = name;
            step.code = code;
            this.save();
        }
    }

    deleteStep(id) {
        this.steps = this.steps.filter((s) => s.id !== id);
        this.save();
    }

    moveStep(index, direction) {
        if (direction === -1 && index > 0) {
            [this.steps[index], this.steps[index - 1]] = [this.steps[index - 1], this.steps[index]];
        } else if (direction === 1 && index < this.steps.length - 1) {
            [this.steps[index], this.steps[index + 1]] = [this.steps[index + 1], this.steps[index]];
        }
        this.save();
    }
}
