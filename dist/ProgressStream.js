"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * Show stream progress and time passed.
 */
class ProgressStream extends stream_1.Transform {
    constructor(size) {
        super();
        this.size = size;
        this.processed = 0;
    }
    _transform(data, encoding, callback) {
        if (!this.start) {
            this.start = Date.now();
        }
        this.processed += data.length;
        const pers = Math.floor((this.processed * 100) / this.size);
        const deltaTime = Date.now() - this.start;
        const timePassed = Math.floor(deltaTime / 1000);
        const elapsedTime = Math.floor(this.calculatedElapsedTime(deltaTime) / 1000);
        console.log(`Progress: ${pers}%, time passed: ${timePassed}s, elapsedTime: ${elapsedTime}s`);
        callback(undefined, data);
    }
    calculatedElapsedTime(deltaTime) {
        const sizeLeft = this.size - this.processed;
        return (sizeLeft / this.processed) * deltaTime;
    }
}
exports.ProgressStream = ProgressStream;
//# sourceMappingURL=ProgressStream.js.map