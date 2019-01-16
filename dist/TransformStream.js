"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * This class can transform all objects in stream.
 *
 * @export
 * @class TransformStream
 * @extends {Transform}
 */
class TransformStream extends stream_1.Transform {
    /**
     * Creates an instance of TransformStream.
     * @param transform function that transform object to another object
     * @memberof TransformStream
     */
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