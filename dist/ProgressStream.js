"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 *
 *
 * @export
 * @class ProgressStream
 * @extends {Transform}
 */
class ProgressStream extends stream_1.Transform {
    constructor(size, logEvery = 10) {
        super();
        this.size = size;
        this.logEvery = logEvery;
        this.processed = 0;
        this.barTemplate = "Progress: %d% %d/%d MB, time passed:%ds eta:%ds, heap: %dMB, rss: %dMB";
        this.nextLog = logEvery;
    }
    _transform(chunk, encoding, callback) {
        if (!this.start) {
            this.start = Date.now();
        }
        this.processed += chunk.length;
        const percent = Math.floor((this.processed * 100) / this.size);
        if (percent > this.nextLog) {
            const deltaTime = Date.now() - this.start;
            const timePassed = Math.floor(deltaTime / 1000);
            const eta = this._calculateElapsedTime(deltaTime);
            const mem = process.memoryUsage();
            const usedHeap = this._byteToMB(mem.heapUsed);
            const rss = this._byteToMB(mem.rss);
            console.log(this.barTemplate, percent, this._byteToMB(this.processed), this._byteToMB(this.size), timePassed, eta, usedHeap, rss);
            this.nextLog = percent + this.logEvery;
        }
        callback(undefined, chunk);
    }
    _calculateElapsedTime(deltaTime) {
        const sizeLeft = this.size - this.processed;
        return Math.floor(((sizeLeft / this.processed) * deltaTime) / 1000);
    }
    _byteToMB(byte) {
        const mb = byte / 1024 / 1024;
        return Math.floor(mb);
    }
}
exports.ProgressStream = ProgressStream;
//# sourceMappingURL=ProgressStream.js.map