"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class TransformStream extends stream_1.Transform {
    constructor(transform) {
        super({ objectMode: true });
        this.transform = transform;
    }
    _transform(chunk, encoding, callback) {
        if (!Array.isArray(chunk)) {
            callback(new Error(`Transform stream can't procces ${typeof chunk} input. It works works only with arrays of objects`));
        }
        const transformed = chunk.map(x => this.transform(x));
        this.push(transformed);
        callback();
    }
}
exports.TransformStream = TransformStream;
//# sourceMappingURL=TransformStream.js.map